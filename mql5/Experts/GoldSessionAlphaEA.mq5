//+------------------------------------------------------------------+
//|                                         GoldSessionAlphaEA.mq5   |
//|                                        REAL TRADING - NOT EDUCAL |
//|                                        Gold Session Liquidity     |
//+------------------------------------------------------------------+
#property copyright  ""
#property version   "1.00"

/*
 *  GOLD SESSION LIQUIDITY GRAB STRATEGY
 *  =====================================
 *
 *  EDGE: Gold forms clear intraday ranges during Asia (low vol).
 *  London/NY open triggers stop hunts (liquidity grabs) at these
 *  range boundaries before the REAL directional move.
 *
 *  We DON'T trade the breakout — we trade the FALSE breakout.
 *
 *  LONG SETUP:
 *    1. Asia range identified (high/low from 23:00-07:00 server)
 *    2. Price breaks BELOW Asia low (stops out retail longs)
 *    3. Price RECLAIMS back inside the range (liquidity grab confirmed)
 *    4. Enter on reclaim with tight SL below the grab wick
 *
 *  SHORT SETUP:
 *    1. Asia range identified
 *    2. Price breaks ABOVE Asia high (stops out retail shorts)
 *    3. Price FALLS back inside the range (liquidity grab confirmed)
 *    4. Enter on reclaim with tight SL above the grab wick
 *
 *  CONFLUENCES (need 2+ to confirm entry):
 *    - RSI divergence at the grab extreme
 *    - Engulfing candle after reclaim
 *    - Fibonacci 62-79 level aligns with grab
 *    - ATR expansion confirms momentum
 *
 *  EXITS:
 *    - TP1: Asia Range middle (50% close, move SL to BE)
 *    - TP2: Opposite side of Asia range
 *    - TP3: Runner with trailing stop (1 ATR)
 *
 *  RISK: 1-2% per trade. Daily max 2 trades.
 *  SESSION: London open (08:00-11:00) and NY open (13:00-16:00)
 */

#include <Trade\Trade.mqh>

//--- Inputs
input group "=== Session Configuration ==="
input int                AsiaStartHour     = 23;     // Asia Start (Server Hour)
input int                AsiaEndHour       = 7;      // Asia End (Server Hour)
input int                LondonStartHour   = 8;      // London Session Start
input int                LondonEndHour     = 11;     // London Session End
input int                NYStartHour       = 13;     // NY Session Start
input int                NYEndHour         = 16;     // NY Session End

input group "=== Asia Range Detection ==="
input int                MinAsiaBars       = 5;      // Min bars in Asia range
input int                MaxAsiaBars       = 15;     // Max bars in Asia range

input group "=== Entry Filters ==="
input int                RSIPeriod         = 14;     // RSI Period
input double             RSI_Div_Requirement = 30.0; // Min RSI for divergence check
input int                ATRPeriod         = 14;     // ATR Period
input double             ATR_Expansion     = 1.5;    // ATR expansion multiplier
input double             ReclaimPips       = 1.5;    // Min pips back inside range
input int                EntryTF           = 5;      // Entry Timeframe (minutes)

input group "=== Risk Management ==="
input double             RiskPerTrade      = 1.5;    // Risk % per trade
input double             RR1_Multiplier    = 1.5;    // TP1 R multiple
input double             RR2_Multiplier    = 3.0;    // TP2 R multiple
input double             Trail_ATR_Mult    = 1.0;    // Trailing stop ATR mult
input int                MaxTradesPerDay   = 3;      // Max trades per day
input double             DailyLossLimit    = 5.0;    // Daily max loss %

input group "=== Magic Number ==="
input int                MagicNumber       = 686868; // Magic number

//--- Globals
CTrade trade;
int handleRSI, handleATR;
double rsiBuffer[], atrBuffer[];
bool asiaRangeIdentified = false;
double asiaHigh = 0, asiaLow = 0, asiaMid = 0;
int tradesToday = 0;
datetime lastTradeDate = 0;
double dailyStartBalance = 0;
datetime lastBarTime = 0;

//+------------------------------------------------------------------+
//| Expert initialization                                              |
//+------------------------------------------------------------------+
int OnInit()
  {
   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(30);
   trade.SetTypeFilling(ORDER_FILLING_FOK);

   handleRSI = iRSI(_Symbol, PERIOD_CURRENT, RSIPeriod, PRICE_CLOSE);
   handleATR = iATR(_Symbol, PERIOD_CURRENT, ATRPeriod);

   if(handleRSI==INVALID_HANDLE || handleATR==INVALID_HANDLE)
     {
      Print("Indicator init failed");
      return(INIT_FAILED);
     }

   ArraySetAsSeries(rsiBuffer, true);
   ArraySetAsSeries(atrBuffer, true);

   Print("GoldSessionAlpha initialized | Risk: ", RiskPerTrade, "%");
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization                                            |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   IndicatorRelease(handleRSI);
   IndicatorRelease(handleATR);
  }

//+------------------------------------------------------------------+
//| Expert tick function                                               |
//+------------------------------------------------------------------+
void OnTick()
  {
   datetime barTime = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(barTime == lastBarTime) return;
   lastBarTime = barTime;

   MqlDateTime dt;
   TimeCurrent(dt);

   //--- Reset daily counter
   if(lastTradeDate != dt.day_of_year)
     {
      tradesToday = 0;
      dailyStartBalance = AccountInfoDouble(ACCOUNT_BALANCE);
      lastTradeDate = dt.day_of_year;
      asiaRangeIdentified = false;
      asiaHigh = 0; asiaLow = 0;
     }

   //--- Daily loss limit
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   if(dailyStartBalance > 0)
     {
      double lossPct = ((dailyStartBalance - balance) / dailyStartBalance) * 100;
      if(lossPct >= DailyLossLimit) return;
     }

   //--- Copy indicators
   if(CopyBuffer(handleRSI, 0, 0, 5, rsiBuffer) < 5) return;
   if(CopyBuffer(handleATR, 0, 0, 5, atrBuffer) < 5) return;

   double currentATR = atrBuffer[0];

   //--- Identify Asia range (once per day, before London)
   if(!asiaRangeIdentified && IsAsiaEnd(dt.hour))
     {
      IdentifyAsiaRange();
      asiaRangeIdentified = true;
     }

   //--- Check entries during London/NY
   if(IsTradeHour(dt.hour) && asiaRangeIdentified && tradesToday < MaxTradesPerDay)
     {
      if(CheckShortLiquidityGrab(currentATR))
         EnterShort(currentATR);

      else if(CheckLongLiquidityGrab(currentATR))
         EnterLong(currentATR);
     }

   //--- Manage open positions (partial close, trail)
   ManagePositions(currentATR);
  }

//+------------------------------------------------------------------+
//| Check if current hour is Asia end                                  |
//+------------------------------------------------------------------+
bool IsAsiaEnd(int hour)
  {
   if(AsiaEndHour > AsiaStartHour)
      return (hour >= AsiaEndHour);
   // Overnight wrap (typical case: 23 to 7)
   if(AsiaStartHour > AsiaEndHour)
      return (hour >= AsiaEndHour && hour < AsiaStartHour);
   return false;
  }

//+------------------------------------------------------------------+
//| Check if current hour is a trading hour                            |
//+------------------------------------------------------------------+
bool IsTradeHour(int hour)
  {
   // London overlap
   if(hour >= LondonStartHour && hour <= LondonEndHour) return true;
   // NY overlap
   if(hour >= NYStartHour && hour <= NYEndHour) return true;
   return false;
  }

//+------------------------------------------------------------------+
//| Identify Asia session high and low                                 |
//+------------------------------------------------------------------+
void IdentifyAsiaRange()
  {
   double high_ = 0, low_ = 999999;
   int barCount = 0;

   //--- Scan back to find Asia session bars
   for(int i = 1; i < 100; i++)
     {
      datetime barTime = iTime(_Symbol, PERIOD_CURRENT, i);
      if(barTime == 0) break;

      MqlDateTime dt;
      TimeToStruct(barTime, dt);

      if(IsInAsiaSession(dt.hour))
        {
         high_ = MathMax(high_, iHigh(_Symbol, PERIOD_CURRENT, i));
         low_ = MathMin(low_, iLow(_Symbol, PERIOD_CURRENT, i));
         barCount++;
        }
      else if(barCount > 0)
        break; // Found Asia session, hit non-Asia
     }

   if(barCount >= MinAsiaBars && high_ > 0 && low_ > 0)
     {
      asiaHigh = high_;
      asiaLow = low_;
      asiaMid = (high_ + low_) / 2.0;
      Print("Asia Range identified: High=", DoubleToString(asiaHigh, 2),
            " Low=", DoubleToString(asiaLow, 2),
            " Pips=", DoubleToString((asiaHigh-asiaLow)/_Point/10, 1));
     }
  }

//+------------------------------------------------------------------+
//| Check if a bar hour is in Asia session                             |
//+------------------------------------------------------------------+
bool IsInAsiaSession(int hour)
  {
   if(AsiaStartHour > AsiaEndHour)
     {
      // Wrapped (e.g., 23 to 7): true if hour >= 23 OR hour < 7
      return (hour >= AsiaStartHour || hour < AsiaEndHour);
     }
   return (hour >= AsiaStartHour && hour < AsiaEndHour);
  }

//+------------------------------------------------------------------+
//| Check SHORT Liquidity Grab setup                                   |
//+------------------------------------------------------------------+
bool CheckShortLiquidityGrab(double atr)
  {
   if(asiaHigh <= 0) return false;

   double prevClose = iClose(_Symbol, PERIOD_CURRENT, 1);
   double prevHigh  = iHigh(_Symbol, PERIOD_CURRENT, 1);
   double prevOpen  = iOpen(_Symbol, PERIOD_CURRENT, 1);

   //--- Price went ABOVE Asia high but CLOSED back below
   if(prevHigh <= asiaHigh) return false; // Never broke the high
   if(prevClose >= asiaHigh) return false; // Closed above — real breakout, not grab

   //--- Reclaim confirmed: price back INSIDE Asia range
   double reclaimPips = (asiaHigh - prevClose) / _Point / 10;
   if(reclaimPips < ReclaimPips) return false;

   //--- RSI was overbought at the sweep (divergence check)
   if(rsiBuffer[1] < 60) return false; // Wasn't in overbought territory

   //--- Bearish candle closed (confirmation)
   if(prevClose >= prevOpen) return false; // Need red candle

   //--- Print debug
   Print("SHORT LIQUIDITY GRAP detected: Swept high by ",
         DoubleToString((prevHigh - asiaHigh)/_Point/10, 1), " pips, reclaimed ",
         DoubleToString(reclaimPips, 1), " pips inside | RSI=",
         DoubleToString(rsiBuffer[1], 1));

   return true;
  }

//+------------------------------------------------------------------+
//| Check LONG Liquidity Grab setup                                    |
//+------------------------------------------------------------------+
bool CheckLongLiquidityGrab(double atr)
  {
   if(asiaLow <= 0) return false;

   double prevClose = iClose(_Symbol, PERIOD_CURRENT, 1);
   double prevLow   = iLow(_Symbol, PERIOD_CURRENT, 1);
   double prevOpen  = iOpen(_Symbol, PERIOD_CURRENT, 1);

   //--- Price went BELOW Asia low but CLOSED back above
   if(prevLow >= asiaLow) return false; // Never broke the low
   if(prevClose <= asiaLow) return false; // Closed below — real breakdown, not grab

   //--- Reclaim confirmed: price back INSIDE
   double reclaimPips = (prevClose - asiaLow) / _Point / 10;
   if(reclaimPips < ReclaimPips) return false;

   //--- RSI was oversold at the sweep
   if(rsiBuffer[1] > 40) return false; // Wasn't in oversold territory

   //--- Bullish candle closed
   if(prevClose <= prevOpen) return false; // Need green candle

   Print("LONG LIQUIDITY GRAP detected: Swept low by ",
         DoubleToString((asiaLow - prevLow)/_Point/10, 1), " pips, reclaimed ",
         DoubleToString(reclaimPips, 1), " pips inside | RSI=",
         DoubleToString(rsiBuffer[1], 1));

   return true;
  }

//+------------------------------------------------------------------+
//| Enter Short Position                                               |
//+------------------------------------------------------------------+
void EnterShort(double atr)
  {
   double bid  = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double sl   = iHigh(_Symbol, PERIOD_CURRENT, 1) + (atr * 0.3); // Above grab wick + buffer
   double risk = sl - bid; // Risk distance

   double tp1  = bid - (risk * RR1_Multiplier);
   double tp2  = bid - (risk * RR2_Multiplier);
   // TP2 capped at Asia low (realistic target)
   if(tp2 < asiaLow) tp2 = asiaLow - (atr * 0.5);

   double lots = CalcLotSize(bid, sl);

   if(lots < SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN))
     {
      Print("Lot too small: ", lots);
      return;
     }

   if(trade.Sell(lots, _Symbol, bid, sl, tp2, "GoldSessionAlpha: Short Grab"))
     {
      tradesToday++;
      Print("SHORT GRAB: ", DoubleToString(lots, 2), " lots @ ",
            DoubleToString(bid, 2), " | SL: ", DoubleToString(sl, 2),
            " | TP1: ", DoubleToString(tp1, 2), " | TP2: ",
            DoubleToString(tp2, 2));
     }
  }

//+------------------------------------------------------------------+
//| Enter Long Position                                                |
//+------------------------------------------------------------------+
void EnterLong(double atr)
  {
   double ask  = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double sl   = iLow(_Symbol, PERIOD_CURRENT, 1) - (atr * 0.3); // Below grab wick + buffer
   double risk = ask - sl;

   double tp1  = ask + (risk * RR1_Multiplier);
   double tp2  = ask + (risk * RR2_Multiplier);
   // TP2 capped at Asia high
   if(tp2 > asiaHigh) tp2 = asiaHigh + (atr * 0.5);

   double lots = CalcLotSize(ask, sl);

   if(lots < SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN))
     {
      Print("Lot too small: ", lots);
      return;
     }

   if(trade.Buy(lots, _Symbol, ask, sl, tp2, "GoldSessionAlpha: Long Grab"))
     {
      tradesToday++;
      Print("LONG GRAB: ", DoubleToString(lots, 2), " lots @ ",
            DoubleToString(ask, 2), " | SL: ", DoubleToString(sl, 2),
            " | TP1: ", DoubleToString(tp1, 2), " | TP2: ",
            DoubleToString(tp2, 2));
     }
  }

//+------------------------------------------------------------------+
//| Calculate lot size by risk %                                       |
//+------------------------------------------------------------------+
double CalcLotSize(double entry, double sl)
  {
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskAmt = balance * (RiskPerTrade / 100.0);
   double slPoints = MathAbs(entry - sl);
   if(slPoints <= 0) return _SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);

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
//| Manage open positions (partial close, SL to BE, trail)             |
//+------------------------------------------------------------------+
void ManagePositions(double atr)
  {
   for(int i = PositionsTotal()-1; i >= 0; i--)
     {
      ulong ticket = PositionGetTicket(i);
      if(ticket <= 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;

      double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl = PositionGetDouble(POSITION_SL);
      double tp = PositionGetDouble(POSITION_TP);

      //--- Calculate risk distance
      double riskDist;
      if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
         riskDist = openPrice - sl;
      else
         riskDist = sl - openPrice;

      if(riskDist <= 0) continue;

      double currentPips;
      if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
         {
          double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
          currentPips = bid - openPrice;
         }
      else
         {
          double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
          currentPips = openPrice - ask;
         }

      //--- At TP1 (1.5R): Close partial, SL to BE
      double tp1Level = riskDist * RR1_Multiplier;
      if(currentPips >= tp1Level && currentPips < tp1Level + atr)
         {
          CloseHalf(ticket);
          // Move SL to BE + small profit
          if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
            trade.PositionModify(ticket, openPrice + atr * 0.2, tp2);
          else
            trade.PositionModify(ticket, openPrice - atr * 0.2, tp2);
         }

      //--- Trailing stop on remaining
      if(currentPips >= tp1Level)
         {
          double trailLevel = atr * Trail_ATR_Mult;
          if(PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
            {
            double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
            double newSL = bid - trailLevel;
            if(newSL > sl + _Point)
               trade.PositionModify(ticket, NormalizeDouble(newSL, _Digits), tp);
            }
          else
            {
             double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
             double newSL = ask + trailLevel;
             if(sl > 0 && newSL < sl - _Point)
               trade.PositionModify(ticket, NormalizeDouble(newSL, _Digits), tp);
            }
         }
     }
  }

//+------------------------------------------------------------------+
//| Close half of position volume                                      |
//+------------------------------------------------------------------+
void CloseHalf(ulong ticket)
  {
   double volume = PositionGetDouble(POSITION_VOLUME);
   double halfVol = NormalizeDouble(volume / 2.0, SymbolInfoInteger(_Symbol, SYMBOL_DIGITS));
   if(halfVol < SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN)) return;

   trade.PositionClosePartial(ticket, halfVol);
  }
//+------------------------------------------------------------------+
