//+------------------------------------------------------------------+
//|                                          TrendFollowingEA.mq5    |
//|                              QuantAcademy - Educational Strategy |
//|                              Module: Trend Following             |
//|                              Difficulty: Beginner                |
//+------------------------------------------------------------------+
#property copyright "QuantAcademy - For Educational Use"
#property version   "1.00"
#property strict

/*  STRATEGY OVERVIEW
 *  -----------------
 *  This EA follows the principle that "the trend is your friend."
 *  It uses three moving averages and ADX to confirm trend direction
 *  and strength before entering trades.
 *
 *  ENTRY CONDITIONS (Long):
 *    1. Fast MA > Medium MA > Slow MA (aligned uptrend)
 *    2. ADX > 25 (strong trend, not choppy)
 *    3. Price pullback: Close touches or dips near Fast MA
 *
 *  ENTRY CONDITIONS (Short):
 *    1. Fast MA < Medium MA < Slow MA (aligned downtrend)
 *    2. ADX > 25
 *    3. Price pullback: Close touches or rises near Fast MA
 *
 *  EXIT CONDITIONS:
 *    - Stop Loss: Recent swing low/high or ATR-based
 *    - Take Profit: 1.5x to 2x risk (configurable)
 *    - Trail Stop: Move SL to breakeven after +1R profit
 *
 *  RISK MANAGEMENT:
 *    - Fixed fractional position sizing (1-2% per trade)
 *    - Maximum concurrent trades configurable
 *    - Daily loss limit to prevent spiral
 */

#include <Trade\Trade.mqh>

//--- Input Parameters
input group "=== Moving Averages ==="
input int                InpFastMA     = 9;        // Fast MA Period
input int                InpMedMA      = 21;       // Medium MA Period
input int                InpSlowMA     = 55;       // Slow MA Period
input ENUM_MA_METHOD     InpMAMethod   = MODE_EMA; // MA Method

input group "=== ADX Settings ==="
input int                InpADXPeriod  = 14;       // ADX Period
input double             InpADXMin     = 25;       // Minimum ADX for Entry

input group "=== ATR & Risk ==="
input int                InpATRPeriod  = 14;       // ATR Period
input double             InpATRStopMult= 2.0;      // SL = ATR * Multiplier
input double             InpRRRatio    = 2.0;      // Take Profit / Stop Loss ratio
input double             InpRiskPercent= 1.0;       // Risk % of Balance per trade

input group "=== Trade Management ==="
input int                InpMaxTrades  = 1;         // Max Concurrent Trades
input double             InpTrailStartR= 1.0;       // Trail Start (in R multiples)
input double             InpTrailStepR = 0.5;       // Trail Step (in R multiples)
input double             InpDailyLossLimit = 5.0;   // Daily Loss Limit (%)
input int                InpMagicNumber = 20250101; // Magic Number

input group "=== Filter ==="
input int                InpTradeStartHour = 3;     // Trading Start Hour (server)
input int                InpTradeEndHour   = 22;    // Trading End Hour (server)

//--- Global Variables
CTrade trade;
int handleFastMA, handleMedMA, handleSlowMA, handleADX, handleATR;
double fastMA[], medMA[], slowMA[], adxLine[], atrVal[];
double entryPrice = 0;
double initialSL  = 0;
double dailyStartBalance = 0;
datetime lastBarTime = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
  {
   //--- Setup trade object
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(10);
   trade.SetTypeFilling(ORDER_FILLING_FOK);
   trade.SetAsyncMode(false);

   //--- Create indicator handles
   handleFastMA  = iMA(_Symbol, PERIOD_CURRENT, InpFastMA,  0, InpMAMethod, PRICE_CLOSE);
   handleMedMA   = iMA(_Symbol, PERIOD_CURRENT, InpMedMA,   0, InpMAMethod, PRICE_CLOSE);
   handleSlowMA  = iMA(_Symbol, PERIOD_CURRENT, InpSlowMA,  0, InpMAMethod, PRICE_CLOSE);
   handleADX     = iADX(_Symbol, PERIOD_CURRENT, InpADXPeriod);
   handleATR     = iATR(_Symbol, PERIOD_CURRENT, InpATRPeriod);

   if(handleFastMA==INVALID_HANDLE || handleMedMA==INVALID_HANDLE ||
      handleSlowMA==INVALID_HANDLE || handleADX==INVALID_HANDLE || handleATR==INVALID_HANDLE)
     {
      Print("ERROR: Failed to create indicator handles");
      return(INIT_FAILED);
     }

   //--- Setup arrays
   ArraySetAsSeries(fastMA, true);
   ArraySetAsSeries(medMA, true);
   ArraySetAsSeries(slowMA, true);
   ArraySetAsSeries(adxLine, true);
   ArraySetAsSeries(atrVal, true);

   //--- Log initialization
   Print("TrendFollowingEA initialized on ", _Symbol, " | TF: ",
         EnumToString(Period()), " | Risk: ", InpRiskPercent, "%");

   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   IndicatorRelease(handleFastMA);
   IndicatorRelease(handleMedMA);
   IndicatorRelease(handleSlowMA);
   IndicatorRelease(handleADX);
   IndicatorRelease(handleATR);

   Print("TrendFollowingEA stopped. Reason: ", reason);
  }

//+------------------------------------------------------------------+
//| Expert tick function                                               |
//+------------------------------------------------------------------+
void OnTick()
  {
   //--- Only check on new bar close (not every tick)
   datetime currentBarTime = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(currentBarTime == lastBarTime) return;  // Not a new bar yet
   lastBarTime = currentBarTime;

   //--- Trading hours filter
   MqlDateTime dt;
   TimeCurrent(dt);
   if(dt.hour < InpTradeStartHour || dt.hour >= InpTradeEndHour) return;

   //--- Daily loss limit check
   double currentBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   if(dailyStartBalance == 0) dailyStartBalance = currentBalance;
   double dailyLossPct = ((dailyStartBalance - currentBalance) / dailyStartBalance) * 100;
   if(dailyLossPct >= InpDailyLossLimit)
     {
      Print("Daily loss limit reached: ", dailyLossPct, "%");
      CloseAllPositions();
      return;
     }

   //--- Copy indicator data (3 most recent bars for confirmation)
   if(!CopyIndicatorData()) return;

   //--- Reset daily balance tracker at new day
   static int prevDay = -1;
   if(dt.day != prevDay && prevDay != -1)
     {
      dailyStartBalance = currentBalance;
     }
   prevDay = dt.day;

   //--- Check if we can open new trades
   int openTrades = CountOpenPositions();
   if(openTrades < InpMaxTrades)
     {
      //--- Evaluate long setup
      if(CheckLongSetup())
         OpenLong();

      //--- Evaluate short setup
      else if(CheckShortSetup())
         OpenShort();
     }

   //--- Manage existing positions: trailing stop
   ManageTrailingStop();
  }

//+------------------------------------------------------------------+
//| Copy and validate all indicator data                               |
//+------------------------------------------------------------------+
bool CopyIndicatorData()
  {
   if(CopyBuffer(handleFastMA,  0, 0, 3, fastMA)  < 3) return false;
   if(CopyBuffer(handleMedMA,   0, 0, 3, medMA)   < 3) return false;
   if(CopyBuffer(handleSlowMA,  0, 0, 3, slowMA)  < 3) return false;
   if(CopyBuffer(handleADX,     0, 0, 3, adxLine) < 3) return false;
   if(CopyBuffer(handleATR,     0, 0, 3, atrVal)  < 3) return false;

   return true;
  }

//+------------------------------------------------------------------+
//| Check Long Setup: MA alignment + ADX + pullback                    |
//+------------------------------------------------------------------+
bool CheckLongSetup()
  {
   //--- MA alignment: Fast > Med > Slow (uptrend)
   bool maAligned = (fastMA[1] > medMA[1]) && (medMA[1] > slowMA[1]);
   if(!maAligned) return false;

   //--- ADX confirms strength
   if(adxLine[1] < InpADXMin) return false;

   //--- Price pulled back toward fast MA
   double prevClose = iClose(_Symbol, PERIOD_CURRENT, 1);
   double pullbackThreshold = fastMA[1] * 0.001; // 0.1% tolerance
   if(prevClose > fastMA[1] + pullbackThreshold) return false; // Didn't pull back

   //--- Previous bar bullish confirmation
   double prevOpen  = iOpen(_Symbol, PERIOD_CURRENT, 1);
   if(prevClose <= prevOpen) return false; // Need green bar

   return true;
  }

//+------------------------------------------------------------------+
//| Check Short Setup: MA alignment + ADX + pullback                   |
//+------------------------------------------------------------------+
bool CheckShortSetup()
  {
   //--- MA alignment: Fast < Med < Slow (downtrend)
   bool maAligned = (fastMA[1] < medMA[1]) && (medMA[1] < slowMA[1]);
   if(!maAligned) return false;

   //--- ADX confirms strength
   if(adxLine[1] < InpADXMin) return false;

   //--- Price pulled back toward fast MA
   double prevClose = iClose(_Symbol, PERIOD_CURRENT, 1);
   double pullbackThreshold = fastMA[1] * 0.001;
   if(prevClose < fastMA[1] - pullbackThreshold) return false; // Didn't pull back

   //--- Previous bar bearish confirmation
   double prevOpen  = iOpen(_Symbol, PERIOD_CURRENT, 1);
   if(prevClose >= prevOpen) return false; // Need red bar

   return true;
  }

//+------------------------------------------------------------------+
//| Open Long Position                                                 |
//+------------------------------------------------------------------+
void OpenLong()
  {
   double ask   = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double sl    = CalculateStopLossLong(ask);
   double tp    = CalculateTakeProfitLong(ask, sl);
   double lots  = CalculateLotSize(ask, sl);

   if(lots < SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN))
     {
      Print("Lot size too small: ", lots);
      return;
     }

   if(trade.Buy(lots, _Symbol, ask, sl, tp, "QuantAcademy: Trend Follow Long"))
     {
      entryPrice = ask;
      initialSL  = sl;
      Print("LONG opened: ", lots, " lots @ ", ask,
            " | SL: ", sl, " | TP: ", tp,
            " | Risk: ", InpRiskPercent, "%");
     }
   else
     {
      Print("LONG order failed: ", GetLastError(), " | ", trade.ResultRetcodeDescription());
     }
  }

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//| Open Short Position                                                 |
//+------------------------------------------------------------------+
void OpenShort()
  {
   double bid   = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double sl    = CalculateStopLossShort(bid);
   double tp    = CalculateTakeProfitShort(bid, sl);
   double lots  = CalculateLotSize(bid, sl);

   if(lots < SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN))
     {
      Print("Lot size too small: ", lots);
      return;
     }

   if(trade.Sell(lots, _Symbol, bid, sl, tp, "QuantAcademy: Trend Follow Short"))
     {
      entryPrice = bid;
      initialSL  = sl;
      Print("SHORT opened: ", lots, " lots @ ", bid,
            " | SL: ", sl, " | TP: ", tp,
            " | Risk: ", InpRiskPercent, "%");
     }
   else
     {
      Print("SHORT order failed: ", GetLastError(), " | ", trade.ResultRetcodeDescription());
     }
  }

//+------------------------------------------------------------------+
//| Calculate Stop Loss for Long (ATR-based)                           |
//+------------------------------------------------------------------+
double CalculateStopLossDouble(double entryPrice)
  {
   return entryPrice - (atrVal[1] * InpATRStopMult);
  }

//+------------------------------------------------------------------+
//| Calculate Stop Loss for Short (ATR-based)                          |
//+------------------------------------------------------------------+
double CalculateStopLossShort(double entryPrice)
  {
   return entryPrice + (atrVal[1] * InpATRStopMult);
  }

//+------------------------------------------------------------------+
//| Calculate Take Profit for Long                                      |
//+------------------------------------------------------------------+
double CalculateTakeProfitLong(double entry, double sl)
  {
   double risk = entry - sl;
   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   return NormalizeDouble(entry + (risk * InpRRRatio), _Digits);
  }

//+------------------------------------------------------------------+
//| Calculate Take Profit for Short                                     |
//+------------------------------------------------------------------+
double CalculateTakeProfitShort(double entry, double sl)
  {
   double risk = sl - entry;
   return NormalizeDouble(entry - (risk * InpRRRatio), _Digits);
  }

//+------------------------------------------------------------------+
//| Calculate Lot Size based on Risk %                                 |
//+------------------------------------------------------------------+
double CalculateLotSize(double entry, double sl)
  {
   double balance  = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskAmt  = balance * (InpRiskPercent / 100.0);
   double slPoints = MathAbs(entry - sl);

   if(slPoints <= 0) return SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);

   double tickValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double pointValue = (tickValue / tickSize);

   double lots = riskAmt / (slPoints * pointValue);

   //--- Normalize to broker step
   double lotStep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   lots = MathFloor(lots / lotStep) * lotStep;

   double minLots = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxLots = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);

   lots = MathMax(lots, minLots);
   lots = MathMin(lots, maxLots);

   return NormalizeDouble(lots, 2);
  }

//+------------------------------------------------------------------+
//| Count currently open positions by this EA                          |
//+------------------------------------------------------------------+
int CountOpenPositions()
  {
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong ticket = PositionGetTicket(i);
      if(ticket > 0 &&
         PositionGetString(POSITION_SYMBOL) == _Symbol &&
         PositionGetInteger(POSITION_MAGIC) == InpMagicNumber)
         count++;
     }
   return count;
  }

//+------------------------------------------------------------------+
//| Manage Trailing Stop (based on R multiple)                         |
//+------------------------------------------------------------------+
void ManageTrailingStop()
  {
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong ticket = PositionGetTicket(i);
      if(ticket <= 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;

      double posOpen   = PositionGetDouble(POSITION_PRICE_OPEN);
      double posSL     = PositionGetDouble(POSITION_SL);

      double risk = MathAbs(posOpen - initialSL);
      if(risk <= 0) continue;

      //--- Only trail after reaching trail start multiple
      if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
        {
         double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
         double profitR = (bid - posOpen) / risk;

         if(profitR >= InpTrailStartR)
           {
            double newSL = bid - (atrVal[0] * InpATRStopMult * InpTrailStepR);
            newSL = NormalizeDouble(newSL, _Digits);
            if(newSL > posSL + _Point)
              {
               trade.PositionModify(ticket, newSL, PositionGetDouble(POSITION_TP));
              }
           }
        }
      else if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_SELL)
        {
         double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
         double profitR = (posOpen - ask) / risk;

         if(profitR >= InpTrailStartR)
           {
            double newSL = ask + (atrVal[0] * InpATRStopMult * InpTrailStepR);
            newSL = NormalizeDouble(newSL, _Digits);
            if(posSL == 0 || newSL < posSL - _Point)
              {
               trade.PositionModify(ticket, newSL, PositionGetDouble(POSITION_TP));
              }
           }
        }
     }
  }

//+------------------------------------------------------------------+
//| Close all positions managed by this EA                             |
//+------------------------------------------------------------------+
void CloseAllPositions()
  {
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong ticket = PositionGetTicket(i);
      if(ticket > 0 &&
         PositionGetString(POSITION_SYMBOL) == _Symbol &&
         PositionGetInteger(POSITION_MAGIC) == InpMagicNumber)
         trade.PositionClose(ticket);
     }
  }
//+------------------------------------------------------------------+
