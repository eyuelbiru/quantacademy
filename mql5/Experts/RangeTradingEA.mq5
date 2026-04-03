//+------------------------------------------------------------------+
//|                                           RangeTradingEA.mq5     |
//|                             QuantAcademy - Educational Strategy  |
//|                             Module: Range / Mean Reversion       |
//|                             Difficulty: Intermediate             |
//+------------------------------------------------------------------+
#property copyright "QuantAcademy - For Educational Use"
#property version   "1.00"
#property strict

/*  STRATEGY OVERVIEW
 *  -----------------
 *  Range trading exploits the fact that markets consolidate ~65-70%
 *  of the time. This EA identifies horizontal support/resistance
 *  using Bollinger Bands and enters mean-reversion trades at extremes.
 *
 *  ENTRY CONDITIONS (Long):
 *    1. Price touches or penetrates Lower Bollinger Band
 *    2. RSI < 30 (oversold)
 *    3. Bullish reversal candlestick (hammer, bullish engulfing)
 *
 *  ENTRY CONDITIONS (Short):
 *    1. Price touches or penetrates Upper Bollinger Band
 *    2. RSI > 70 (overbought)
 *    3. Bearish reversal candlestick (shooting star, bearish engulfing)
 *
 *  RANGE DETECTION FILTER:
 *    - ADX < 20 indicates non-trending conditions (confirming range)
 *    - Band Width narrowing indicates consolidation
 *
 *  EXIT CONDITIONS:
 *    - Take Profit: Middle Band (SMA 20)
 *    - Stop Loss: Beyond the Bollinger Band extreme
 *    - Time Stop: Close after N bars if TP/SL not hit
 *
 *  RISK MANAGEMENT:
 *    - Fixed fractional: 1% risk per trade
 *    - Max 2 open range trades
 *    - Daily loss limit: 3%
 */

#include <Trade\Trade.mqh>

//--- Input Parameters
input group "=== Bollinger Bands ==="
input int                InpBBPeriod     = 20;       // BB Period
input double             InpBBDeviation  = 2.0;      // BB Deviation
input ENUM_APPLIED_PRICE InpBBPrice      = PRICE_CLOSE; // BB Applied Price

input group "=== RSI & Filter ==="
input int                InpRSIPeriod    = 14;       // RSI Period
input double             InpRSIOversold  = 30.0;     // RSI Oversold Level
input double             InpRSIOverbought= 70.0;     // RSI Overbought Level
input double             InpADXMax       = 20.0;     // Max ADX (range filter)

input group "=== Risk Management ==="
input double             InpRiskPercent  = 1.0;      // Risk % per Trade
input int                InpTimeStopBars = 12;       // Time Stop (bars)
input int                InpMaxTrades    = 2;         // Max Concurrent Trades
input double             InpDailyLossPct = 3.0;       // Daily Loss Limit (%)
input int                InpMagicNumber  = 20250201; // Magic Number

//--- Globals
CTrade trade;
int handleBBUpper, handleBBLower, handleBBMiddle, handleRSI, handleADX;
double bbUpper[], bbLower[], bbMiddle[];
double rsiVal[], adxLine[];
double dailyStartBalance = 0;
datetime lastBarTime = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
  {
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(10);
   trade.SetTypeFilling(ORDER_FILLING_FOK);

   //--- Custom indicator handles via iCustom for BB
   handleADX  = iADX(_Symbol, PERIOD_CURRENT, 14);
   handleRSI  = iRSI(_Symbol, PERIOD_CURRENT, InpRSIPeriod, InpBBPrice);

   //--- Bollinger Bands via iBands
   handleBBUpper   = iBands(_Symbol, PERIOD_CURRENT, InpBBPeriod, 0, InpBBDeviation, InpBBPrice);

   if(handleBBUpper==INVALID_HANDLE || handleRSI==INVALID_HANDLE || handleADX==INVALID_HANDLE)
     {
      Print("ERROR: Failed to create indicator handles");
      return(INIT_FAILED);
     }

   ArraySetAsSeries(bbUpper, true);
   ArraySetAsSeries(bbLower, true);
   ArraySetAsSeries(bbMiddle, true);
   ArraySetAsSeries(rsiVal, true);
   ArraySetAsSeries(adxLine, true);

   Print("RangeTradingEA initialized on ", _Symbol,
         " | BB(", InpBBPeriod, ",", InpBBDeviation,
         ") | RSI(", InpRSIPeriod, ") | Risk: ", InpRiskPercent, "%");

   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   IndicatorRelease(handleBBUpper);
   IndicatorRelease(handleRSI);
   IndicatorRelease(handleADX);
  }

//+------------------------------------------------------------------+
//| Expert tick function                                               |
//+------------------------------------------------------------------+
void OnTick()
  {
   datetime barTime = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(barTime == lastBarTime) return;
   lastBarTime = barTime;

   //--- Trading hours filter (avoid low-liquidity hours)
   MqlDateTime dt;
   TimeCurrent(dt);
   if(dt.hour < 3 || dt.hour >= 22) return;

   //--- Copy indicator data
   if(!CopyAllData()) return;

   //--- Daily loss check
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   if(dailyStartBalance == 0) dailyStartBalance = balance;
   double lossPct = ((dailyStartBalance - balance) / dailyStartBalance) * 100;
   if(lossPct >= InpDailyLossPct) return;

   static int prevDay = -1;
   if(dt.day != prevDay && prevDay != -1) dailyStartBalance = balance;
   prevDay = dt.day;

   //--- Check for new trade setups
   if(CountOpen() < InpMaxTrades)
     {
      if(CheckLongEntry())
         EnterLong();

      else if(CheckShortEntry())
         EnterShort();
     }

   //--- Time stop management
   ManageTimeStop();
  }

//+------------------------------------------------------------------+
//| Copy all indicator buffers                                         |
//+------------------------------------------------------------------+
bool CopyAllData()
  {
   //--- iBands: buffer 0=middle, 1=upper, 2=lower
   if(CopyBuffer(handleBBUpper, 1, 0, 3, bbUpper) < 3) return false;
   if(CopyBuffer(handleBBUpper, 0, 0, 3, bbMiddle) < 3) return false;
   if(CopyBuffer(handleBBUpper, 2, 0, 3, bbLower) < 3) return false;

   if(CopyBuffer(handleRSI, 0, 0, 3, rsiVal) < 3) return false;
   if(CopyBuffer(handleADX, 0, 0, 3, adxLine) < 3) return false;

   return true;
  }

//+------------------------------------------------------------------+
//| Check Long Entry Setup                                             |
//+------------------------------------------------------------------+
bool CheckLongEntry()
  {
   double prevClose = iClose(_Symbol, PERIOD_CURRENT, 1);
   double prevOpen  = iOpen(_Symbol, PERIOD_CURRENT, 1);

   //--- Price touched lower band
   if(prevClose > bbLower[1]) return false;

   //--- RSI oversold
   if(rsiVal[1] > InpRSIOversold) return false;

   //--- Market in range (ADX low = no strong trend)
   if(adxLine[1] > InpADXMax) return false;

   //--- Bullish reversal candle
   bool hammer   = CheckHammerBullish(1);
   bool engulfing = CheckEngulfingBullish(1, 2);
   bool doji_bounce = CheckDojiBounceBullish(prevOpen, prevClose, bbLower[1]);

   return (hammer || engulfing || doji_bounce);
  }

//+------------------------------------------------------------------+
//| Check Short Entry Setup                                            |
//+------------------------------------------------------------------+
bool CheckShortEntry()
  {
   double prevClose = iClose(_Symbol, PERIOD_CURRENT, 1);
   double prevOpen  = iOpen(_Symbol, PERIOD_CURRENT, 1);

   //--- Price touched upper band
   if(prevClose < bbUpper[1]) return false;

   //--- RSI overbought
   if(rsiVal[1] < InpRSIOverbought) return false;

   //--- Market in range
   if(adxLine[1] > InpADXMax) return false;

   //--- Bearish reversal candle
   bool star    = CheckShootingStar(1);
   bool engulfing = CheckEngulfingBearish(1, 2);
   bool doji_break = CheckDojiBreakBearish(prevOpen, prevClose, bbUpper[1]);

   return (star || engulfing || doji_break);
  }

//+------------------------------------------------------------------+
//| Candlestick Pattern: Bullish Hammer                                |
//+------------------------------------------------------------------+
bool CheckHammerBullish(int barShift)
  {
   double o = iOpen(_Symbol, PERIOD_CURRENT, barShift);
   double c = iClose(_Symbol, PERIOD_CURRENT, barShift);
   double l = iLow(_Symbol, PERIOD_CURRENT, barShift);
   double h = iHigh(_Symbol, PERIOD_CURRENT, barShift);

   if(c <= o) return false; // Must be bullish
   double body = c - o;
   double lowerWick = MathMin(o, c) - l;
   double range = h - l;
   if(range == 0) return false;

   return (lowerWick >= (body * 2)) && (lowerWick / range >= 0.6);
  }

//+------------------------------------------------------------------+
//| Candlestick Pattern: Bullish Engulfing                             |
//+------------------------------------------------------------------+
bool CheckEngulfingBullish(int current, int previous)
  {
   double prevOpen  = iOpen(_Symbol, PERIOD_CURRENT, previous);
   double prevClose = iClose(_Symbol, PERIOD_CURRENT, previous);
   double currOpen  = iOpen(_Symbol, PERIOD_CURRENT, current);
   double currClose = iClose(_Symbol, PERIOD_CURRENT, current);

   //--- Previous is bearish, current is bullish and engulfs
   if(prevClose >= prevOpen) return false;
   if(currClose <= currOpen) return false;
   if(currOpen >= prevClose) return false;
   if(currClose <= prevOpen) return false;

   return true;
  }

//+------------------------------------------------------------------+
//| Candlestick Pattern: Doji Bounce at Lower Band                     |
//+------------------------------------------------------------------+
bool CheckDojiBounceBullish(double open_, double close_, double band)
  {
   double body = MathAbs(close_ - open_);
   double range = iHigh(_Symbol, PERIOD_CURRENT, 1) - iLow(_Symbol, PERIOD_CURRENT, 1);
   if(range == 0) return false;

   //--- Doji (very small body) near lower band
   return (body / range < 0.1) && (close_ > open_) && (iLow(_Symbol, PERIOD_CURRENT, 1) <= band);
  }

//+------------------------------------------------------------------+
//| Candlestick Pattern: Shooting Star                                 |
//+------------------------------------------------------------------+
bool CheckShootingStar(int barShift)
  {
   double o = iOpen(_Symbol, PERIOD_CURRENT, barShift);
   double c = iClose(_Symbol, PERIOD_CURRENT, barShift);
   double h = iHigh(_Symbol, PERIOD_CURRENT, barShift);
   double l = iLow(_Symbol, PERIOD_CURRENT, barShift);

   if(c >= o) return false; // Must be bearish
   double body = o - c;
   double upperWick = h - MathMax(o, c);
   double range = h - l;
   if(range == 0) return false;

   return (upperWick >= (body * 2)) && (upperWick / range >= 0.6);
  }

//+------------------------------------------------------------------+
//| Candlestick Pattern: Bearish Engulfing                             |
//+------------------------------------------------------------------+
bool CheckEngulfingBearish(int current, int previous)
  {
   double prevOpen  = iOpen(_Symbol, PERIOD_CURRENT, previous);
   double prevClose = iClose(_Symbol, PERIOD_CURRENT, previous);
   double currOpen  = iOpen(_Symbol, PERIOD_CURRENT, current);
   double currClose = iClose(_Symbol, PERIOD_CURRENT, current);

   if(prevClose <= prevOpen) return false; // Previous bullish
   if(currClose >= currOpen) return false; // Current bearish
   if(currOpen <= prevClose) return false; // Must engulf
   if(currClose >= prevOpen) return false;

   return true;
  }

//+------------------------------------------------------------------+
//| Candlestick Pattern: Doji Break at Upper Band                      |
//+------------------------------------------------------------------+
bool CheckDojiBreakBearish(double open_, double close_, double band)
  {
   double body = MathAbs(close_ - open_);
   double range = iHigh(_Symbol, PERIOD_CURRENT, 1) - iLow(_Symbol, PERIOD_CURRENT, 1);
   if(range == 0) return false;

   return (body / range < 0.1) && (close_ < open_) && (iHigh(_Symbol, PERIOD_CURRENT, 1) >= band);
  }

//+------------------------------------------------------------------+
//| Enter Long Position at Range Bottom                                |
//+------------------------------------------------------------------+
void EnterLong()
  {
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double sl  = bbLower[1] - (atr[0] * 0.5); // Below BB lower
   double tp  = bbMiddle[1]; // Target = middle band
   double lots = CalcLotSize(ask, sl);

   if(lots < SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN)) return;

   if(trade.Buy(lots, _Symbol, ask, sl, tp, "QA: Range Trade Long"))
     {
      Print("RANGE LONG: ", lots, " lots @ ", ask, " SL: ", sl, " TP: ", tp);
     }
  }

//+------------------------------------------------------------------+
//| Enter Short Position at Range Top                                  |
//+------------------------------------------------------------------+
void EnterShort()
  {
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double sl  = bbUpper[1] + (atr[0] * 0.5); // Above BB upper
   double tp  = bbMiddle[1]; // Target = middle band
   double lots = CalcLotSize(bid, sl);

   if(lots < SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN)) return;

   if(trade.Sell(lots, _Symbol, bid, sl, tp, "QA: Range Trade Short"))
     {
      Print("RANGE SHORT: ", lots, " lots @ ", bid, " SL: ", sl, " TP: ", tp);
     }
  }

//+------------------------------------------------------------------+
//| Calculate Lot Size                                                 |
//+------------------------------------------------------------------+
double CalcLotSize(double entry, double sl)
  {
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskAmt = balance * (InpRiskPercent / 100.0);
   double slPoints = MathAbs(entry - sl);
   if(slPoints <= 0) return SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);

   double tickValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double pointValue = tickValue / tickSize;
   double lots = riskAmt / (slPoints * pointValue);

   double step = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   lots = MathFloor(lots / step) * step;
   lots = MathMax(lots, SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN));
   lots = MathMin(lots, SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX));

   return NormalizeDouble(lots, 2);
  }

//+------------------------------------------------------------------+
//| Count open positions                                               |
//+------------------------------------------------------------------+
int CountOpen()
  {
   int count = 0;
   for(int i = PositionsTotal()-1; i >= 0; i--)
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
//| Time Stop: Close if trade held too long                            |
//+------------------------------------------------------------------+
void ManageTimeStop()
  {
   for(int i = PositionsTotal()-1; i >= 0; i--)
     {
      ulong ticket = PositionGetTicket(i);
      if(ticket <= 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;

      datetime openTime = (datetime)PositionGetInteger(POSITION_TIME);
      datetime current  = iTime(_Symbol, PERIOD_CURRENT, 0);
      int barsElapsed = (int)((current - openTime) / PeriodSeconds());

      if(barsElapsed >= InpTimeStopBars)
         trade.PositionClose(ticket);
     }
  }
//+------------------------------------------------------------------+
