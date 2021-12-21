
/**
 *  Custom classes
 */
var MinDp2d3 =  function (){
	this.getDescription = function() { return "MinDP2 with no decimal point, MinDP3 if a decimal point exists"; }

	this.calculate = function(vars){
		var x=y;
		vars.formattedStrikePriceRuleName = vars.formattedStrikePrice.endsWith(".0") ? "MinDp2" : "MinDp3";
		return JRulesOptionsExt.formatStrikePriceForRic(vars.formattedStrikePrice,false,vars);
	}
}


var SetValue = function (){
	this.getDescription = function(){return "returns a constant value given as args.value";}
	this.calculate = function(vars,args){return args.value;}
}

var Ticker_IceLiffe = function Ticker_IceLiffe(){
	var description = "";

	this.calculate = function(vars){

		var exchangeSymbol = vars.exchangeSymbol;
		if(exchangeSymbol.length<12)
			throw new Error("exchangeSymbol is less than 12 characters long");
        if(exchangeSymbol.indexOf(' FM')<0 && exchangeSymbol.indexOf(' FQ')<0 && exchangeSymbol.indexOf(' FY')<0 )
            throw 'Doesn\'t contain <space>FM or <space>FQ or <space>FY.';
		var ticker = exchangeSymbol.substring(0,4).trim();
        if (ticker.length==0) throw 'Empty ticker in exchangeSymbol';
        var contractType = exchangeSymbol.substring(4,5);
        if (contractType!='F') 	throw 'Contract type expected \'F\' but in the record it is: '+contractType;
		return ticker;
	}
	this.getDescription = function(){return description;}
}
var Ticker_IceLiffeIUS = function Ticker_IceLiffeIUS(){
	var description = "";
	this.calculate = function(vars){
		return vars.record.ID_EXCH_SYMBOL;
	}
	this.getDescription = function(){return description;}
}

var MonthCode_IceLiffe = function MonthCode_IceLiffe(){
    var description = "";

    this.calculate = function(vars){
		var month = vars.exchangeSymbol.substring(6,7);
		return month;
	}
	this.getDescription = function(){return description;}
}

var YearCode_IceLiffe = function YearCode_IceLiffe(){
    var description = "";

    this.calculate = function(vars){
		var year = vars.exchangeSymbol.substring(10,11);
		return year;
	}
	this.getDescription = function(){return description;}
}

var RicRoot_IceLiffe = function RicRoot_IceLiffe(){
     var description = "";

    this.calculate = function(vars){
		var contractSymbol = vars.exchangeSymbol;
        var ricRoot;
        if (contractSymbol.endsWith('_Z'))
            ricRoot = vars.master.RIC_ROOT_TAS;
        else ricRoot = vars.master.RIC_ROOT;
		return ricRoot;
	}
	this.getDescription = function(){return description;}
}

var ChainRic_IceLiffe = function ChainRic_IceLiffe(){
     var description = "";

    this.calculate = function(vars){
        var contractSymbol = vars.exchangeSymbol;
        var chainRic;
        if (contractSymbol!=null && contractSymbol.endsWith('_Z'))
            chainRic = 'Z'+vars.ricRoot;
        else chainRic = vars.ricRoot+":";
		return chainRic;
	}
	this.getDescription = function(){return description;}
}

var Ric_FutureTradingSessionToRicPrefix = function (){
	this.getDescription = function(){return "FUT_TRADING_SESSION->RIC_prefix: N->'1',D->'2',B->''";}
	this.calculate = function(vars){

		var prefix = '';
		var futureTradingSession = vars.futureTradingSession;
		if (futureTradingSession!=null) {
			if (futureTradingSession=='N') prefix='1';
			else if (futureTradingSession=='D' && vars.symbol.indexOf(" PIT ")>0) prefix='2';
		}
		return prefix+vars.ric;
	}
}

var Ric_TradingSessionToRicPrefix = function (){
	this.getDescription = function(){return "<Bbg ID>->RIC_prefix: ' ELEC '->'1' ' PIT '->'2' ' COMB '->''";}
	this.calculate = function(vars){
		var prefix = '';
		if (vars.symbol.indexOf(' ELEC ')>=0) prefix='1';
		if (vars.symbol.indexOf(' PIT ')>=0) prefix='2';
		return prefix+vars.ric;
	}
}

/* this procedure should be removed and bellow one used instead. Needs to be tested on futures. bottom one works for both futures and FOPS */
var ChainRic_FutureTradingSessionToRicPrefix = function (){
	this.getDescription = function(){return "FUT_TRADING_SESSION->ChainRIC_prefix: N->'1',D->'2',B->''";}
	this.calculate = function(vars){
		var prefix = '';
		var futureTradingSession = vars.futureTradingSession;
		if (futureTradingSession!=null) {
			if (futureTradingSession=='N') prefix='1';
			else if (futureTradingSession=='D' && vars.symbol.indexOf(" PIT ")>0) prefix='2';
		}
		return prefix+vars.ricRoot+":";
	}
}

var ChainRic_FutureTradingSessionToRicPrefix_MONFutures = function (){
	this.getDescription = function(){return "FUT_TRADING_SESSION->ChainRIC_prefix: N->'1',D->'2',B->''";}
	this.calculate = function(vars){
		var prefix = '';
		var futureTradingSession = vars.futureTradingSession;
		if (futureTradingSession!=null) {
			if (futureTradingSession=='N') prefix='1';
			else if (futureTradingSession=='D' && vars.symbol.indexOf(" PIT ")>0) prefix='2';
		}
		var suffix = ':';
		var securityType = vars.record.SECURITY_TYP;
		if (securityType==null || securityType.length==0) throw "SECURITY_TYP not defined";
		if(securityType=="SINGLE STOCK FUTURE")suffix=":MO";

		return prefix+vars.ricRoot+suffix;
	}
}

var ChainRic_FutureTradingSessionToRicPrefix_BMEFutures = function (){
	this.getDescription = function(){return "FUT_TRADING_SESSION->ChainRIC_prefix: N->'1',D->'2',B->''";}
	this.calculate = function(vars){
		var exchangeRicSuffix = ":BO";
		if (vars.record.SECURITY_TYP.indexOf("index")>-1) exchangeRicSuffix = ":";
		var prefix = '';
		var futureTradingSession = vars.futureTradingSession;
		if (futureTradingSession!=null) {
			if (futureTradingSession=='N') prefix='1';
			else if (futureTradingSession=='D' && vars.symbol.indexOf(" PIT ")>0) prefix='2';
		}
		return prefix+vars.ricRoot+exchangeRicSuffix;
	}
}

var ChainRic_FutureTradingSessionToRicPrefix_OSESpreads = function (){
	this.getDescription = function(){return "FUT_TRADING_SESSION->ChainRIC_prefix: N->'1',D->'2',B->''";}
	this.calculate = function(vars){
		var prefix = '';
		var futureTradingSession = vars.futureTradingSession;
		if (futureTradingSession!=null) {
			if (futureTradingSession=='N') prefix='1';
			else if (futureTradingSession=='D' && vars.symbol.indexOf(" PIT ")>0) prefix='2';
		}
		return prefix+vars.ricRoot+"-:";
	}
}

var ChainRic_FutureTradingSessionToChainRicPrefix = function (){
	this.getDescription = function(){return "FUT_TRADING_SESSION->ChainRIC_prefix: N->'1',D->'2',B->''";}
	this.calculate = function(vars){
		var prefix = '';
		var futureTradingSession = vars.futureTradingSession;
		if (futureTradingSession!=null) {
			if (futureTradingSession=='N') prefix='1';
			else if (futureTradingSession=='D' && vars.symbol.indexOf(" PIT ")>0) prefix='2';
		}
		return prefix+vars.chainRic;
	}
}

var ChainRic_TradingSessionToChainRicPrefix = function (){
	this.getDescription = function(){return "<Bbg ID>->ChainRIC_prefix: ' ELEC '->'1' ' PIT '->'2' ' COMB '->''";}
	this.calculate = function(vars){
		var prefix = '';
		if (vars.symbol.indexOf(' ELEC ')>=0) prefix='1';
		if (vars.symbol.indexOf(' PIT ')>=0) prefix='2';
		return prefix+vars.chainRic;
	}
}

var VersionLetter_Eurex = function (){
	this.getDescription = function(){return "GenerationNumber 0,1,2... -> VersionLetter '','a','b'...";}
	this.calculate = function(vars){
		return JRulesEurex.getTRVersionLetter(vars.record.GENERATION_NUMBER);
	}
}

var FormatStrikePrice_Eurex =  function (){
	this.getDescription = function(){return "Default Eurex Options Rule";}
	this.calculate = function(vars){
		return JRulesEurex.formatStrikePriceForRic(vars.formattedStrikePrice,vars.optionOnFuture=="Y",vars);
	}
}

var ChainRicRoot_EuroNext =  function (){
	this.getDescription = function(){return "Using CHAIN_EXCEPTION field content (if defined) as a chain RIC root";}
	this.calculate = function(vars) {
		var chainRicRoot = vars.ricRoot;
		var notStandardChainRicRoot = vars.master.CHAIN_EXCEPTION;
		if (notStandardChainRicRoot!=null && notStandardChainRicRoot.length>0)
			chainRicRoot = notStandardChainRicRoot;
		return chainRicRoot;
	}
}

var ExchangeRicSuffix_EuroNext =  function (){
	this.getDescription = function(){return "Euronext ID_MIC_PRIM_EXCH to exchange ric suffix lookup";}
	this.calculate = function(vars){
		return marketMicToExchangeSuffix(vars.record.ID_MIC_PRIM_EXCH);
	}
}

var SetMicCodeDefault = function SetMicCodeDefault(){
    var description = "If MIC code missing, set to defualt value";
    this.calculate = function(vars,args){
    		var micCode = vars.record.ID_MIC_PRIM_EXCH;
    		if(micCode==null || micCode.length==0 || micCode=="null")
    			vars.record.MIC_X = args.defaultMic;
    		return null;
	}
	this.getDescription = function(){return description;}
}

var Filter_HongKongHKG_Equity = function () {
	this.getDescription = function(){return "Filter out if SECURITY_TYP=Spot index. and CRNCY is blank";}
	this.calculate = function(vars,args){
	   if (vars.record.SECURITY_TYP=="Spot index.") {
		   if (vars.record.CRNCY==null || vars.record.CRNCY.length==0)
			   return "SECURITY_TYP=Spot index. and CRNCY is blank";
	   }
	   return null;
	}
}

var SetMicCodeDefaultHKG = function(){
    var description = "If MIC code missing, set to defualt value";

   this.calculate = function(vars,args){

	   for (var key in vars.record ) {
		   if (vars.record[key]=="null")
			   vars.record[key] = "";
		 }

	   var micCode = vars.record.ID_MIC_PRIM_EXCH;
	   if(micCode==null || micCode.length==0 || micCode=="null") {
	       vars.record.MIC_X = args.defaultMic;
	   }
	   return null;
	}
	this.getDescription = function(){return description;}
}


var SetMIC_XfromMIC1orID_MIC_LOCAL =  function (){
	this.getDescription = function(){return "Use ID_MIC1 for FixedIncome, otherwise ID_MIC_LOCAL_EXCH";}
	this.calculate = function(vars,args){
		vars.record.MIC_X = "FixedIncome"==vars.record.BPIPE_REFERENCE_SECURITY_CLASS ? vars.record.ID_MIC1 : vars.record.ID_MIC_LOCAL_EXCH;
		return null;
	}
}

var FormatStrikePrice_IceIEU =  function (){
	this.getDescription = function(){return "Formated Strike Price IceIEU options";}
	this.calculate = function(vars) {
		if (vars.formattedStrikePriceRuleName==null || vars.formattedStrikePriceRuleName.length==0) {
			var bdStrike = JBigDecimal.valueOf(vars.formattedStrikePrice).stripTrailingZeros();
			var exp=bdStrike.scale()<0 ? 0 : bdStrike.scale();
			var formattedStrikePrice = bdStrike.multiply(JBigDecimal.valueOf(JMath.pow(10,exp))).longValue().toString();
			while (formattedStrikePrice.length<3)
				formattedStrikePrice = "0"+formattedStrikePrice;
			return formattedStrikePrice;
		} else {
			return JRulesOptionsExt.formatStrikePriceForRic(vars.formattedStrikePrice,vars.optionOnFuture=="Y",vars);
		}
	}
}

var MasterRecordSearch_EuroNext =  function (){
	this.getDescription = function(){return "Define condition for getMasterRecord";}
	this.calculate = function(vars){
		return (new JDBCField("TICKER")).eq(new JDBCField(vars.ticker)).and((new JDBCField("MARKET_MIC")).eq(vars.record.ID_MIC_PRIM_EXCH));
	}
}

var FormatStrikePrice_EuroNext =  function (){
	this.getDescription = function(){return "Formated Strike Price EuroNex";}

	this.calculate = function(vars){
		var bdStrike = JBigDecimal.valueOf(vars.formattedStrikePrice).stripTrailingZeros();
		var str="";
		if(bdStrike.scale()<2){
           var enFormatter = new JDecimalFormat("#0.00");
           str=enFormatter.format(bdStrike);
        }else str=bdStrike.toPlainString()
		return JRulesEuroNext.formatStrikePriceForRic(str,vars.record.ID_MIC_PRIM_EXCH);

	}
}

var FormatStrikePrice_ASX =  function (){
	this.getDescription = function(){return "Formated Strike Price EuroNex";}

	this.calculate = function(vars){
		var bdStrike = JBigDecimal.valueOf(vars.formattedStrikePrice).stripTrailingZeros();
		var str="";
		if(bdStrike.scale()<=0 && bdStrike.compareTo(JBigDecimal.valueOf("999"))>0){
			var enFormatter = new JDecimalFormat("#0");
			str=enFormatter.format(bdStrike);
		}else if(bdStrike.compareTo(JBigDecimal.valueOf("0.1"))==0){
			str = "10";
		}else if(bdStrike.scale()<2){
			var enFormatter = new JDecimalFormat("#0.00");
			str=enFormatter.format(bdStrike);
			str = str.replace(new RegExp('\\.', 'g'), '');
		}else{
			var exp=bdStrike.scale()<0?0:bdStrike.scale();
			str = bdStrike.multiply(JBigDecimal.valueOf(JMath.pow(10,exp))).longValue().toString();
		}
		return str;

	}
}

var FormatStrikePrice_ASXNew_UnderTest =  function (){
	this.getDescription = function(){return "Formated Strike Price EuroNex";}
	this.calculate = function(vars){
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice).stripTrailingZeros();
		if (bdStrike.getValue()<100 || bdStrike.getDP()>0)
			bdStrike = bdStrike.multiply(100).setDP(0).removeDP();
		return bdStrike.toString();
	}
}
var RIC_ASX =  function (){
	this.getDescription = function(){return "Formated Strike Price EuroNex";}

	this.calculate = function(vars){
		var ric=vars.ric;
		if (JBigDecimal.valueOf(vars.record.OPT_STRIKE_PX).compareTo(JBigDecimal.valueOf("0.01"))==0) {
			if ("M"==vars.record.EXPIRATION_PERIODICITY) {
				var fullExchangeSymbol = vars.record.ID_FULL_EXCHANGE_SYMBOL;
				if (fullExchangeSymbol==null || fullExchangeSymbol.length==0)
					throw "Missing ID_FULL_EXCHANGE_SYMBOL (needed for 'small strike' RIC)";
				var idx = fullExchangeSymbol.lastIndexOf(".");
				if (idx<0)
					throw "ID_FULL_EXCHANGE_SYMBOL without suffix";
				ric = vars.record.ID_EXCH_SYMBOL+fullExchangeSymbol.substring(idx+1) + vars.exchangeRicSuffix;
			}
		}
		return ric;
	}
}

var Filter_Out_Put_For_Strike_0_01 =  function (){
	this.getDescription = function(){return "Filter out PUT options for strike 0.01";}
	this.calculate = function(vars){
		var strike=vars.record.OPT_STRIKE_PX;
		if ("0.01"!=strike) return null;
		var putCall=vars.record.OPT_PUT_CALL;
		if ("Put"!=putCall) return null;
		return "Put option for strike 0.01";
	}
}

// =================================================================================================
// HongKong HFE
var ExchangeRicSuffix_HongKong =  function (){
	this.getDescription = function(){return "HongKong ID_MIC_PRIM_EXCH to exchange ric suffix lookup";}
	this.calculate = function(vars){
		if ("Equity Option"==vars.record.SECURITY_TYP) return ".HK";
		return ".HF";

	}
}

var VersionLetter_HongKongHFE_Options =  function (){
	this.getDescription = function(){return "Extract characters after '-' in the master table field RIC_ROOT, use 0 if empty string";}
	this.calculate = function(vars){
		if ("Index Option"==vars.record.SECURITY_TYP || "Currency option."==vars.record.SECURITY_TYP)
			return "";
		var vnum = vars.master.GENERATION;
		if (vnum==null || vnum.length==0) return "0";
		return vnum;
	}
}

var FormatStrikePrice_HK =  function (){
	this.getDescription = function(){return "Formated Strike Price HongKongHFE";}

	this.calculate = function(vars){
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice).stripTrailingZeros();

		if ("Index Option"==vars.record.SECURITY_TYP) {
			var str = bdStrike.setDP(0).removeDP().toString();
			while (str.length<5)
				str = "0"+str;
			return str;
		}else if ("Currency option."==vars.record.SECURITY_TYP) {
			bdStrike=bdStrike.setDP(2)
			var format = new JDecimalFormat("000.00");
			var str = format.format(bdStrike.getBigDecimal());
			str = str.replace(new RegExp('\\.', 'g'), '');
			return str;
		}
		if ("Equity Option"==vars.record.SECURITY_TYP) {
			bdStrike.setDP(2);
			return bdStrike.setDP(2).removeDP().toString();
		} else if (bdStrike.getDP()<=0) {
			return bdStrike.toString("#0000");
		} else {
			bdStrike.setDP(bdStrike.getDP()-1)
			return bdStrike.removeDP().toString();
		}
	}
}

var Ric_HongKongHFE_Options =  function (){
	this.getDescription = function(){return "";}

	this.calculate = function(vars){
		if ("W"!=vars.periodicity) return vars.ric;
		var expDate = vars.record.EXPIRATIONDATE_X;
		var expDay = expDate.substring(6,8);
		var ric = vars.ricRoot+vars.formattedStrikePrice+"W"+expDay +vars.monthYearCode + vars.exchangeRicSuffix;
		return ric;
	}
}
var ChainRic_HongKongHFE_Options =  function (){
	this.getDescription = function(){return "";}

	this.calculate = function(vars){
		if ("W"!=vars.periodicity) return vars.ric;
		return vars.chainRic+"W";
	}
}

var FormatStrikePrice_SydneySFE =  function (){
	this.getDescription = function(){return "Formated Strike Price SydneySFE";}

	this.calculate = function(vars){
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
		if (bdStrike.getDP()<2)
			bdStrike.setDP(2);
		return bdStrike.removeDP().toString();
	}
}

var L2_Euronext = function(){
		this.getDescription = function(){return "L2 Euronext: RICd->SYM'?level=2' + 0RIC->sSYM + 1RIC->sSYM";}

		this.calculate = function(vars){
			var record = vars.record;
			var ric = record.RIC;
			record.SYMBOL = record.SYMBOL+'?level=2';
			record.RIC= ric+'d';
			var record1=new JRecord(record);
			record1.RIC= '0'+ric;
			var record2=new JRecord(record);
			record2.RIC= '1'+ric;
			return JArrays.asList(record,record1,record2);
		}
}

var RMSCode_AmericanISINtoCUSIP = function () {
	this.getDescription = function(){return "American ISIN -> CUSIP";}

	this.calculate = function(vars){
		var prefix = vars.rmsCode.substring(0,2);
		if (["US","CA"].indexOf(prefix) < 0) return vars.rmsCode;
		return vars.rmsCode.substring(2,vars.rmsCode.length-1);
	}
}


var FormatStrikePrice_OsakaOSE =  function (){
	this.getDescription = function(){return "Formated Strike Price OsakaOSE";}

	this.calculate = function(vars){
		if ("Y"==vars.optionOnFuture)
			return JRulesOptionsExt.formatStrikePriceForRic(vars.formattedStrikePrice,vars.optionOnFuture=="Y",vars);
		var str;
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
		if ("Index Option"==vars.record.SECURITY_TYP) {
			var minDigits = (vars.ricRoot=="JTI" && bdStrike.compareTo(1000)>=0) ? 4 : 5;
			str = bdStrike.setDP(0).removeDP().toString();
			if (str.length<minDigits)
				str = "0"+str;
		} else {
			var minDigits = bdStrike.compareTo(100)<0 ? 2 : 3;
			str = bdStrike.removeDP().toString();
			while (str.length>minDigits && str.charAt(str.length-1)=='0')
				str = str.substring(0,str.length-1);
			while (str.length<3)
				str = ("0"+str);
		}
		if (str.length>3)
			str = str.substring(0,3);
		return str;
	}
}

var Ric_OsakaOSE =  function (){
	this.getDescription = function(){return "Append generation letter based on forth token in the field TRADING_SYSTEM_IDENTIFIER";}

	this.calculate = function(vars){
		var generationLetter = this.calculateGenerationLetter(vars);
		if (vars.ric==null) throw "Ric not defined in vars,"+vars;
		if (vars.ricRoot==null) throw "RicRoot not defined in vars,"+vars;
		if (vars.ricRoot.length>vars.ric) throw "RicRoot longer than Ric in vars,"+vars;
		// insert generation letter in the ric after the ricRoot
		vars.ric = vars.ric.substring(0,vars.ricRoot.length)+generationLetter+vars.ric.substring(vars.ricRoot.length,vars.ric.length);
		// prefix ric with the trading session prefix
		return new Ric_TradingSessionToRicPrefix().calculate(vars);
	}

	var generationLetters = ["Y","Z","A","B","C","D","E","F","G"];
	this.calculateGenerationLetter = function(vars){
		if ("Y"==vars.optionOnFuture) return "";
		if ("Index Option"==vars.record.SECURITY_TYP) return "";
		var TRADING_SYSTEM_IDENTIFIER = vars.record.TRADING_SYSTEM_IDENTIFIER;
		if (TRADING_SYSTEM_IDENTIFIER==null || TRADING_SYSTEM_IDENTIFIER.length==0) return "";
		var tokens = TRADING_SYSTEM_IDENTIFIER.split("_");
		if (tokens.length!=7) throw "TRADING_SYSTEM_IDENTIFIER must have 7 tokens but it has "+tokens.length;
		var generationNumber = parseInt(tokens[3]);
		if (generationNumber<0 || generationNumber>8) return "Y";//throw "Generation number supported range is 0<=X<=9 but value is: "+generationNumber;
		return generationLetters[generationNumber];
	}

	this.calculateOLD = function(vars){
		if ("Y"==vars.optionOnFuture)
			return vars.ricRoot;
		if ("Index Option"==vars.record.SECURITY_TYP)
			return vars.ricRoot;
		var TRADING_SYSTEM_IDENTIFIER = vars.record.TRADING_SYSTEM_IDENTIFIER;
		if (TRADING_SYSTEM_IDENTIFIER==null || TRADING_SYSTEM_IDENTIFIER.length==0)
			return vars.ricRoot;
		var tokens = TRADING_SYSTEM_IDENTIFIER.split("_");
		if (tokens.length!=7)
			throw "TRADING_SYSTEM_IDENTIFIER must have 7 tokens but it has "+tokens.length;
		var generationNumber = parseInt(tokens[3]);
		if (generationNumber<0 || generationNumber>9)
			throw "Generation number supported range is 0<=X<=9 but value is: "+generationNumber;
		return vars.ricRoot+generationLetters[generationNumber];
	}
}

var Ric_SpreadOsakaOSE = function (){
	this.getDescription = function(){return "Ric calculation for Osaka OSE";}
	this.calculate = function(vars){

		var prefix = '';
		var futureTradingSession = vars.futureTradingSession;
		if (futureTradingSession!=null) {
			if (futureTradingSession=='N') prefix='1';
			else if (futureTradingSession=='D' && vars.symbol.indexOf(" PIT ")>0) prefix='2';
		}
		// FSPR_REIT_1706/REIT_1709
		// month 1 becomes M7 (june 17)
		// month 2 becomes U9 (sep 17)
		// Construct the RIC ---> RIC ROOT + MonthYear1 + "-" + MonthYear2

		var futures = vars.exchangeSymbol.split("/");
		if (futures.length!=2)
			throw "exchangeSymbol can not be split int two tokens: "+vars.exchangeSymbol;
		if (futures[0].length<5)
			throw "exchangeSymbol token1 is too short: "+futures[0];
		if (futures[1].length<5)
			throw "exchangeSymbol token2 is too short: "+futures[1];
		var monthYearCode1 = futures[0].substring(futures[0].length-4);
		var monthYearCode2 = futures[1].substring(futures[1].length-4);

		var ric = prefix+vars.ricRoot+JStaticTables.futuresConvertMonthToCode(monthYearCode1.substring(2,4))+monthYearCode1.substring(1,2)
		 						+"-"+JStaticTables.futuresConvertMonthToCode(monthYearCode2.substring(2,4))+monthYearCode2.substring(1,2);

		return ric;
	}
}

var Ticker_MilanFutures = function Ticker_MilanFutures(){
	var description = "Use PARSEKYABLE_DES_SOURCE to extract the ticker. If PARSEKYABLE_DES_SOURCE ends 'Index' or 'Comdty' then use ID_EXCH_SYMBOL."+
					  "If PARSEKYABLE_DES_SOURCE ends with the 'Equity' then use the characters before '=' as the ticker";

	this.calculate = function(vars){

		var pds = vars.record.PARSEKYABLE_DES_SOURCE;
		if(pds.endsWith('Index') || pds.endsWith('Comdty'))
			return vars.record.ID_EXCH_SYMBOL;
        if(pds.indexOf('=') >-1)
        	return pds.substring(0,pds.indexOf('='));
        throw new Error("PARSEKYABLE_DES_SOURCE is not in expected format!");
		return null;
	}
	this.getDescription = function(){return description;}
}

var Ticker_MilanOptions = function Ticker_MilanOptions(){
	var description = "Use ID_EXCH_SYMBOL.";

	this.calculate = function(vars){
		return vars.record.ID_EXCH_SYMBOL;
	}
	this.calculateOld = function(vars){
		var ticker = vars.record.PARSEKYABLE_DES_SOURCE;
		if(ticker.indexOf(' ')>-1)
			return ticker.substring(0,ticker.indexOf(' '));
		else
			throw new Error("PARSEKYABLE_DES_SOURCE is not in expected format!");
	}
	this.getDescription = function(){return description;}
}

var RicRoot_MilanMIL_Options = function RicRoot_MilanMIL_Options(){
	this.getDescription = function(){return "Add ricRoot suffix for European options: CASH_SETTLED=Y/N -> c/p ";}

   this.calculate = function(vars){
	   var cashSettled = vars.record.CASH_SETTLED;
	   var expType = vars.record.OPT_EXER_TYP;
	   var secType = vars.record.SECURITY_TYP;
	   var ricRoot = vars.ricRoot;
	   var exchangeSymbol = vars.record.ID_FULL_EXCHANGE_SYMBOL;

	   if ("European"==expType && "Equity Option"==secType) {
		   if ("N"==cashSettled)
			   ricRoot += "p";
		   else if ("Y"==cashSettled)
			   ricRoot += "c";
	   }
	   var lastChar = exchangeSymbol.substring(exchangeSymbol.length-1,exchangeSymbol.length);
	   if (lastChar.toLowerCase() != lastChar.toUpperCase())  // if a letter
		   ricRoot+=lastChar.toLowerCase();
	   return ricRoot;
	}
}

var FormatStrikePrice_MilanMil =  function (){
	this.getDescription = function(){return "Formated Strike Price MilanMil";}

	this.calculate = function(vars){
		if (vars.optionOnFuture=="Y") {
			return JRulesOptionsExt.formatStrikePriceForRic(vars.formattedStrikePrice,vars.optionOnFuture=="Y",vars);
		}
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);

		var exchangeSymbol = vars.record.ID_FULL_EXCHANGE_SYMBOL;
		var lastChar = exchangeSymbol.substring(exchangeSymbol.length-1,exchangeSymbol.length);
		if (lastChar.toLowerCase() != lastChar.toUpperCase()) { // if a letter
			if(bdStrike.getValue()>99 && bdStrike.getValue()<=1000 && bdStrike.stripTrailingZeros().getDP()<=0)
				return bdStrike.stripTrailingZeros().toString();
			else
				return bdStrike.setDP(4).removeDP().toString();
		}
		if (bdStrike.getValue()>=1000) {
			return bdStrike.devide(10).setDP(0).removeDP().toString();
		} else {
			if(bdStrike.getValue()>99 && bdStrike.stripTrailingZeros().getDP()<=0)
				return bdStrike.stripTrailingZeros().toString();
			if (bdStrike.getDP()<3)
				bdStrike.setDP(3);
			return bdStrike.removeDP().toString();
		}
	}
}

var Ticker_MadridOptions = function Ticker_MadridOptions(){
	var description = "For Equity Options use ID_FULL_EXCHANGE_SYMBOL  to extract the ticker. Remove the first character which will be P or C as put call indicator."+
					  "Take the next series of characters before the first numeric, strip any trailing spaces.";

	this.calculate = function(vars){
		var ticker;
		var secType = vars.record.SECURITY_TYP;
		if ("Physical index option."==secType) {
			ticker = vars.record.ID_EXCH_SYMBOL;
		} else if ("Equity Option"==secType) {
			var mticker = vars.record.ID_FULL_EXCHANGE_SYMBOL;
			if(mticker.startsWith('C') || mticker.startsWith('P'))
				mticker=mticker.substring(1);
			var ticker='';
			for(var i=0;i<mticker.length;i++){
				if(ApacheStringUtils.isNumeric(mticker.substring(i,i+1))) break;
				ticker+=mticker.substring(i,i+1);
			}
		} else {
			throw "Ticker extraction not defined for SECURITY_TYP="+secType;
		}

		return ticker;
	}
	this.getDescription = function(){return description;}
}

var RmsVenue_DefaultValue= function () {
	this.getDescription = function(){return "Venue set to vars.args.defaultVenue if ID_MIC_LOCAL_EXCH is not defined";}

	this.calculate = function(vars,args){
		var localMic = vars.record.ID_MIC_LOCAL_EXCH;
		if (localMic==null || localMic.length==0) {
			if (args==null || args.defaultVenue==null || args.defaultVenue.length==0)
				throw "Default venue not defined";
			return args.defaultVenue;
		}
		return JStaticTables.exchangesGetVenuesFromMic(localMic);
	}
}

var Filter_Out_SpainMCE_Equities = function (){
	this.getDescription = function(){return "Filter instruments where Type = Warrant and LOCAL MIC is NOT equal to XMCE";}
	this.calculate = function(vars){
		var type=vars.record.BPIPE_REFERENCE_SECURITY_CLASS;
		if (type==null) return null;
		type = type.toUpperCase();
		if (type!="WARRANT") return null;
		var mic = vars.record.ID_MIC_LOCAL_EXCH;
		if (mic==null) return null;
		if (mic!="XMCE") return "Type = Warrant and LOCAL MIC is NOT equal to XMCE";
		return null;
	}
}

var Ric_BMESpainMRV_Options = function (){
	this.getDescription = function(){return "Append '.i' to the RIC ";}
	this.calculate = function(vars){
		return vars.ric+".i";
	}
}

var FormatStrikePrice_BMESpainMRV_Options =  function (){
	this.getDescription = function(){return "Formated Strike Price BMESpainMRV_Options";}

	this.calculate = function(vars){
		if (vars.optionOnFuture=="Y") {
			return JRulesOptionsExt.formatStrikePriceForRic(vars.formattedStrikePrice,vars.optionOnFuture=="Y",vars);
		}
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
		var str = bdStrike.setDP(2).removeDP().toString();
		return str;
	}
}

var RicRoot_BMESpainMRV_Options = function RicRoot_BMESpainMRV_Futures(){
	this.getDescription = function(){return "Add suffix 'e' to RicRoot for 'Equity Option' & 'European' ";}

	this.calculate = function(vars){
		var ricRoot = vars.ricRoot;
		var secType = vars.record.SECURITY_TYP;
		if ("Equity Option"==secType) {
			var type = vars.record.OPT_EXER_TYP;
			if ("European"==type)
				ricRoot+="e";
		}
		return ricRoot;
	}
}

var RicRoot_BMESpainMRV_Futures = function RicRoot_BMESpainMRV_Futures(){
	this.getDescription = function(){return "RicRoot_BMESpainMRV_Futures";}

   this.calculate = function(vars){
	   var cashSettled = vars.record.CASH_SETTLED;
       var ricRoot = vars.ricRoot;
       if ("N"==cashSettled)
    	   ricRoot = ricRoot.replace(new RegExp('mrv', 'g'), 'mv');
 		return ricRoot;
	}
}

var RmsVenue_From_Nyse_MicCode_Or_FeedSource = function () {
	this.getDescription = function() {return "Use MicCode is not defined derive Venue from FEED_SOURCE";}

	var feedToVenueLookup = JXHostContext.getLookupTable("bbg__lookups").getLookupEx("FeedToVenue_NYSE");

	this.calculate = function(vars,args){
	    var micCode = vars.micCode;
		var venue = null;
	    if ((micCode != null) && micCode.length>0 && micCode!="null" && micCode!="_emp_") {
	    		venue = JStaticTables.exchangesGetVenuesFromMic(micCode)
	    		if (venue!=null) return venue;
	    }
		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource==null || feedSource.length==0)
			throw "FEED_SOURCE not defined";
		if ("US"==feedSource) {
			if (args==null || args.ruleName==null || args.ruleName.length==0) {
				throw "args.ruleName not defined";
			} else if (args.ruleName=="NasdaqNSM") {
				venue = "NSM";
			} else if (args.ruleName=="NyseArcaPSE") {
				venue = "PCQ";
			} else if (args.ruleName=="NewYorkNYS") {
				venue = "NYQ";
			} else
				throw "args.ruleName value not supported: "+args.ruleName;
		} else if ("UN"==feedSource){
			if (args==null || args.ruleName==null || args.ruleName.length==0) {
				throw "args.ruleName not defined";
			} else if (args.ruleName=="NasdaqNSM") {
				venue = "NAS";
			} else if (args.ruleName=="NyseArcaPSE") {
				venue = "ASE";
			} else if (args.ruleName=="NewYorkNYS") {
				venue = "NYS";
			} else
				throw "args.ruleName value not supported: "+args.ruleName;
		} else {
			var lookupRecord =  feedToVenueLookup.getRecordEx(feedSource);
			if (lookupRecord!=null) {
				if (lookupRecord.STATUS!='ACTIVE')
					return null;
				venue = lookupRecord.VALUE;
			}
		}
		if (venue==null)
			throw "Venue not defined for FEED_SOURCE="+feedSource;
		return venue;
	}
}

var Ric_From_Nyse_ExchangeSymbol_And_FeedSource = function (){

	this.getDescription = function(){return "RIC = EXCHANGE_SYMBOL+Suffix(FEED_SOURCE)";}

	var map = {};
	alphabet.forEach(function(letter){
		var X = letter.toUpperCase();
		var x = letter.toLowerCase();
		map['.WS.'+X]	='_t'+x;
		map['p'+X+".CL"]	='_p'+x;
		map['p'+X]		='_p'+x;
		map['r'+X]		='_r'+x;
		map['.'+X]		=     x;
	});
	map['.WS']			='_t';
	map['.WD']			='w';
	map['.WI']			='_w';
	map['.U']			='_u';
	map['.CL']			='';
	map['p']				='_p';
	map['r']				='_r';

	var feedToSuffixLookup = JXHostContext.getLookupTable("bbg__lookups").getLookupEx("FeedToSuffix_NYSE");

	var symbolToRICConversionNYSE = function(symbol){
		var ric = symbol;
		var keys = Object.keys(map);
		for (var i = 0; i < keys.length; i++) {
		    var val = map[keys[i]];
		    if (ric.endsWith(keys[i])) {
		    		ric=ric.substring(0,ric.length-keys[i].length)+val;
		    		break;
		    }
		}
		return ric;
	}

	this.calculate = function(vars,args){
		var symbol = vars.record.EXCHANGE_SYMBOL;
		if (symbol==null || symbol.length==0)
			throw "EXCHANGE_SYMBOL not defined";
		var ric = symbolToRICConversionNYSE(symbol);
		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource==null || feedSource.length==0)
			throw "FEED_SOURCE not defined";
		var suffix = null;
		if ("US"==feedSource) {
			if (args==null || args.ruleName==null || args.ruleName.length==0) {
				throw "args.ruleName not defined";
			} else if (args.ruleName=="NasdaqNSM") {
				suffix = "O";
			} else if (args.ruleName=="NyseArcaPSE" || args.ruleName=="NewYorkNYS") {
				// extract characters before first lowercase char or '.' in the symbol
				var ricRootEndIndex;
				for (ricRootEndIndex=0 ; ricRootEndIndex<symbol.length ; ricRootEndIndex++) {
					var char = symbol[ricRootEndIndex];
					if (symbol[char]=='.' || char==char.toLowerCase()) break;
				}
				if (ricRootEndIndex>3)
					suffix = "K";
				else
					suffix = "";
			} else {
				throw "Not supported args.ruleName="+args.ruleName;
			}
		} else if ("UN"==feedSource) {
			if (args==null || args.ruleName==null || args.ruleName.length==0) {
				throw "args.ruleName not defined";
			} else if (args.ruleName=="NasdaqNSM") {
				suffix = "N";
			} else if (args.ruleName=="NyseArcaPSE"){
				suffix = "N";
			} else if ( args.ruleName=="NewYorkNYS") {
				suffix="N";
			} else {
				throw "Not supported args.ruleName="+args.ruleName;
			}
		}else {
			var lookupRecord =  feedToSuffixLookup.getRecordEx(feedSource);
			if (lookupRecord!=null) {
				if (lookupRecord.STATUS!='ACTIVE')
					return null;
				suffix = lookupRecord.VALUE;
			}
		}
		if (suffix==null)
			throw "Suffix not defined for FEED_SOURCE="+feedSource;
		if (suffix.length()>0)
			ric+=("."+suffix);
		return ric;
	}
}

var FormatStrikePrice_RemoveDecimals =  function (){
	this.getDescription = function(){return "Formated Strike Price - Remove DP";}

	this.calculate = function(vars){
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
		bdStrike.setDP(0);
		return bdStrike.toString();
	}
}

var Symbol_KoreaKSC_Spreads = function (){
	this.getDescription = function(){return "symbol + '?l1&l2'";}
	this.calculate = function(vars){
		return vars.symbol+'?l1&l2';
	}
}

var Symbol_KoreaKFE_Futures = function (){
	this.getDescription = function(){return "symbol + '?l1&l2'";}
	this.calculate = function(vars){
		var prefix = '';
		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource=="eKFE") prefix="C";
		else if(feedSource=="cKFE" ) prefix="CM";

		var t=prefix+vars.ricRoot;
		if('c' == vars.ric.substring(t.length,t.length+1)) return vars.symbol;
		return vars.symbol+'?l1&l2';
	}
}

var ExchangeRicSuffix_KoreaOptions = function(){
	this.getDescription = function(){return "Korea ID_MIC_PRIM_EXCH to exchange ric suffix lookup";}
	this.calculate = function(vars){
		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource!=null && "KOPT"==feedSource) return ".KS";
		return "";

	}
}

var ChainRic_KoreaOptions = function(){
	this.getDescription = function(){return "Korea ID_MIC_PRIM_EXCH to exchange ric suffix lookup";}
	this.calculate = function(vars){
		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource!=null && "KOPT"==feedSource) return vars.chainRic;
		return vars.chainRic+":";
	}
}

var L2_SingaporeSIM_Futures = function(){
	this.getDescription = function(){return "Both D and D1 prefixes";}

	this.calculate = function(vars){
		var ric = vars.ric;
		var record = vars.record;

		record.SYMBOL = vars.symbol+'?level=2';

		record.RIC= 'D'+ric;
		var record1=new JRecord(record);
		record.RIC= 'D1'+ric;
		var record2=new JRecord(record);
		return JArrays.asList(record1,record2);
	}
}

var Ric_SpreadSingaporeSIM = function (){
	this.getDescription = function(){return "Spread RIC rule for Singapore SIM";}
	this.calculate = function(vars) {

		var insertion = '';
		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);
		if(monthYearCode1==monthYearCode2)throw "CURRENT_CONTRACT_MONTH_YR: monthYearCode1 == monthYearCode2!";

		var ric = vars.ricRoot+insertion+"H"+monthYearCode1+"-"+monthYearCode2+"S1";
		return ric;
	}
}

var FormatStrikePrice_SingaporeSIM_Options =  function (){
	this.getDescription = function(){return "Formated Strike Price SingaporeSIM_Options";}

	this.calculate = function(vars){
		var stikePrice;
		if(vars.record.ID_EXCH_SYMBOL == 'IN'){
			var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
			stikePrice=bdStrike.stripTrailingZeros().toString();;
		}else{
			var pds = vars.record.PARSEKYABLE_DES_SOURCE;
			var ind1 =pds.indexOf(' ');
			var ind2 =pds.indexOf(' ',ind1+1);
			if(ind1==-1 && ind2==-1)
				throw new Error("PARSEKYABLE_DES_SOURCE is not in expected format!");
			stikePrice=pds.substring(ind1+1,ind2);
		}
		stikePrice = stikePrice.replace(new RegExp('\\.', 'g'), '');

		return stikePrice;
	}
}

function FeedSourceToRicPrefix(vars) {
	var prefix = '';
	var feedSource = vars.record.FEED_SOURCE;
	if (feedSource!=null) {
		if (feedSource.startsWith('e')) {
			if (vars.symbol.indexOf(" ELEC ")>0) prefix='1';
		} else if (feedSource.startsWith('c')) {
			prefix='';
		} else {
			prefix='2';
		}
	}
	return prefix;
}

var Ric_FeedSourceToRicPrefixCBTCME = function (){
	this.getDescription = function(){return "FEED_SOURCE->RIC_prefix: 'e'&'ELEC'->'1','c'->'', else '2'";}
	this.calculate = function(vars){
		return FeedSourceToRicPrefix(vars)+vars.ric;
	}
}


var ChainRicOption_FeedSourceToChainRicPrefixCBTCME = function (){
	this.getDescription = function(){return "FEED_SOURCE->RIC_prefix: 'e'&'ELEC'->'1','c'->'', else '2'";}
	this.calculate = function(vars){
		return FeedSourceToRicPrefix(vars)+vars.chainRic;
	}
}

var FormatStrikePrice_DpCorrectionToDefault = function (){
	this.getDescription = function(){return "FormatStrikePrice_DpCorrectionToDefault";}
	this.calculate = function(vars){
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
		var formattedStrikePrice = JRulesOptionsExt.formatStrikePriceForRic(vars.formattedStrikePrice,vars.optionOnFuture=="Y",vars);
		if (bdStrike.compareTo("1")<0 && formattedStrikePrice.startsWith("0"))
			formattedStrikePrice = formattedStrikePrice.substring(1,formattedStrikePrice.length);
		return formattedStrikePrice;
	}
}

var FormatStrikePrice_6digits_Options =  function (){
	this.getDescription = function(){return "Formated Strike Price for OsloOSL_Options, NordicSTO_Options.";}

	this.calculate = function(vars){

		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
		bdStrike.setDP(2);

		var format = new JDecimalFormat("0000.00");
		var formattedStrikPrice = format.format(bdStrike.getBigDecimal());
		formattedStrikPrice = formattedStrikPrice.replace(new RegExp('\\.', 'g'), '');

		return formattedStrikPrice;
	}
}

var Ticker_NordicSTOOptions = function Ticker_NordicSTOOptions(){
	var description = function(){return "Use Symbol (before first space).";}

	this.calculate = function(vars){
		/*var index = vars.symbol.indexOf(' ');
		if (index<=0)
			throw "Symbol does not contain multiple tokens to extract a ticker: "+vars.symbol;
		var ticker = vars.symbol.substring(0,index);*/
		var ticker = vars.record.OPTION_ROOT_TICKER;
		if(ticker==null)
			throw new Error("OPTION_ROOT_TICKER is null!");
		return ticker;
	}

}

var ExchangeRicSuffix_NordicSTO_Options = function ExchangeRicSuffix_NordicSTO_Options(){
	var description = function(){return "The exchangeRICSuffix is '.ST' UNLESS the ID_MIC_PRIM_EXCH='XCSE' in which case it will be '.CO'";}

	this.calculate = function(vars){
		var exchangeRicSuffix = "";
		if("XSTO" == vars.record.ID_MIC_PRIM_EXCH) exchangeRicSuffix=".ST";
		else if("XCSE" == vars.record.ID_MIC_PRIM_EXCH) exchangeRicSuffix=".CO";
		else if("XHEL" == vars.record.ID_MIC_PRIM_EXCH) exchangeRicSuffix=".HE";
		return exchangeRicSuffix;
	}
}

var Ric_NordicSTO_FuturesOld = function (){
	var description = function(){return "If the SECURITY_TYP contains 'index' OR ID_MIC_PRIM_EXCH= 'XHEL' then NO suffix "+
					"IF ID_MIC_PRIM_EXCH='XSTO'  Suffix =':ST' "+
					"IF ID_MIC_PRIM_EXCH='XCSE' Suffix =':CO'";}

	this.calculate = function(vars){
		var exchangeRicSuffix = "";
		if(vars.record.SECURITY_TYP.indexOf("index")>-1 || "XHEL" == vars.record.ID_MIC_PRIM_EXCH) exchangeRicSuffix="";
		else if("XSTO" == vars.record.ID_MIC_PRIM_EXCH) exchangeRicSuffix=":ST";
		else if("XCSE" == vars.record.ID_MIC_PRIM_EXCH) exchangeRicSuffix=":CO";
		return vars.ric+exchangeRicSuffix;
	}
}

var Ric_NordicSTO_Futures = function (){
	var description = function(){return "";}
	this.calculate = function(vars){
		var exchangeRicSuffix = vars.master.RIC_SUFFIX;
		if (exchangeRicSuffix==null)
			exchangeRicSuffix="";
		return vars.ric+exchangeRicSuffix;
	}
}

var ChainRic_NordicSTO_Futures = function (){
	this.getDescription = function(){return "vars.chainRic+vars.master.RIC_SUFFIX";}
	this.calculate = function(vars){
		if(vars.master.RIC_SUFFIX != null && vars.master.RIC_SUFFIX.length > 0)
			return vars.chainRic.substring(0,vars.chainRic.length-1)+vars.master.RIC_SUFFIX;
		else return vars.chainRic;
	}
}

var Ric_Weekly_NordicSTO_OptionsOLD = function Ric_Weekly_NordicSTO_OptionsOLD(){
	var description = function(){return "If weekly options , ric ends with month code + suffix";}

	this.calculate = function(vars){
		var ticker = vars.ticker;
		var ric = vars.ric;
		var exchangeRicSuffix = vars.exchangeRicSuffix;
		if(ApacheStringUtils.isNumeric(ticker.substring(0,1))){
			var rticker = ticker.substring(1);
			if (["BOL", "FIN", "SKFB", "SSABA", "SUBC"].indexOf(rticker) < 0)
				ric=ric.substring(0,ric.length-vars.exchangeRicSuffix.length-1)+exchangeRicSuffix;
		}
		return ric;
	}
}

var Ric_Weekly_NordicSTO_Options = function Ric_Weekly_NordicSTO_Options(){
	var description = function(){return "If weekly options , ric ends with month code + suffix";}

	this.calculate = function(vars){
		var ticker = vars.ticker;
		var ric = vars.ric;
		var exchangeRicSuffix = vars.exchangeRicSuffix;
		if("W"==vars.record.EXPIRATION_PERIODICITY)
			ric=ric.substring(0,ric.length-vars.exchangeRicSuffix.length-1)+exchangeRicSuffix;
		return ric;
	}
}
var MicCode_OsloOSL_Equity = function MicCode_OsloOSL_Equity(){
	var description = function(){return "If SECURITY_TYP = 'Open-End Fund', miCode='XOSL'.";}

	this.calculate = function(vars){
		var micCode = null;
		var secTyp = vars.record.SECURITY_TYP;
		if("Open-End Fund" == secTyp) micCode="XOSL";
		return micCode;
	}
}

var RicRoot_NordicSTO_Futures = function (){
	this.getDescription = function(){return "If CASH_SETTLED is 'Y' suffix = 'C' and SECURITY_TYP not contains 'index'.";}

	this.calculate = function(vars){
		var suffix='';
		if('Y' == vars.record.CASH_SETTLED && vars.record.SECURITY_TYP.indexOf("index")<0) suffix='C';
		return vars.ricRoot+suffix;
	}
}

var MasterRecordSearch_Ticker_FEED_SOURCE =  function (){
	this.getDescription = function(){return "Define condition for getMasterRecord";}
	this.calculate = function(vars){
		return (new JDBCField("TICKER")).eq(new JDBCField(vars.ticker)).and((new JDBCField("FEED_SOURCE")).eq(vars.record.FEED_SOURCE));
	}
}

var Ric_IndiaNSI_Futures = function Ric_IndiaNSI_Futures(){
	var description = function(){return "RIC+':NS'";}

	this.calculate = function(vars){
		var exchangeRicSuffix = "";
		if ( vars.record.FUTURES_CATEGORY == "STOCK FUTURE") exchangeRicSuffix = ":NS";
		return vars.ric+exchangeRicSuffix;
	}
}

var ChainRic_IndiaNSI_Futures = function (){
	this.getDescription = function(){return "vars.chainRic+':NS'";}
	this.calculate = function(vars){
		var exchangeRicSuffix = "";
		if( vars.record.FUTURES_CATEGORY == "STOCK FUTURE") exchangeRicSuffix = "NS";
		return vars.chainRic+exchangeRicSuffix;
	}
}

var FormatStrikePrice_IndiaNSI_Options =  function (){
	this.getDescription = function(){return "Formated Strike Price for IndiaNSI_Options.";}

	this.calculate = function(vars){
		var secTyp = vars.record.SECURITY_TYP;
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
		var formattedStrikPrice="";

		if("Index Option" == secTyp){
			bdStrike.setDP(0);
			var format = new JDecimalFormat("00000");
			var formattedStrikPrice = format.format(bdStrike.getBigDecimal());
		}else if("Equity Option" == secTyp){
			if(bdStrike.getBigDecimal().precision() - bdStrike.getDP()==5){
				var format = new JDecimalFormat("00000.0");
				var formattedStrikPrice = format.format(bdStrike.getBigDecimal());
				formattedStrikPrice = formattedStrikPrice.replace(new RegExp('\\.', 'g'), '');
			}else{
				bdStrike.setDP(2);
				var format = new JDecimalFormat("0000.00");
				var formattedStrikPrice = format.format(bdStrike.getBigDecimal());
				formattedStrikPrice = formattedStrikPrice.replace(new RegExp('\\.', 'g'), '');
			}
		}else if("Currency option." == secTyp){
			bdStrike.setDP(2).removeDP();
			var format = new JDecimalFormat("0000");
			var formattedStrikPrice = format.format(bdStrike.getBigDecimal());
		}else throw new Error("Undefined format for strike price!");
		return formattedStrikPrice;
	}
}

var RicRoot__IndiaNSI_Options = function (){
	this.getDescription = function(){return "Calculate RicRoot suffix";}

	this.calculate = function(vars){
		var suffix="";
		if('Weekly Index Options' == vars.record.FUTURES_CATEGORY){
			var underlyingTicker  = vars.record.OPT_UNDL_TICKER;
			if (underlyingTicker==nuill || underlyingTicker.length<2)
				throw "OPT_UNDL_TICKER empty or too short for weekly option";
			var lastChar  = vars.record.OPT_UNDL_TICKER.substring(vars.record.OPT_UNDL_TICKER.length-1);
			switch(lastChar){
				case 'A':suffix = "1W";break;
				case 'B':suffix = "2W";break;
				case 'C':suffix = "3W";break;
				case 'D':suffix = "4W";break;
				default:suffix="";
			}
		}
		return vars.ricRoot+suffix;
	}
}
var Ric_IndiaNSI_Options = function Ric_IndiaNSI_Options(){
	var description = function(){return "If SECURITY_TYP=’Equity Option’ , ric ends with month code + suffix";}

	this.calculate = function(vars){
		var secTyp = vars.record.SECURITY_TYP;
		var ric = vars.ric;
		var exchangeRicSuffix = vars.exchangeRicSuffix;
		if("Equity Option" == secTyp){
			ric=ric.substring(0,ric.length-vars.exchangeRicSuffix.length-1)+exchangeRicSuffix;
		}
		return ric;
	}
}

var FormatStrikePrice_LondonLSE_Options =  function (){
	this.getDescription = function(){return "Formated Strike Price for LondonLSE_Options.";}

	this.calculate = function(vars){
		var formattedStrikPrice = vars.formattedStrikePrice;
		if("Equity Option" == vars.record.SECURITY_TYP || "Index Option" == vars.record.SECURITY_TYP){
			var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
			bdStrike.setDP(2);

			var format = new JDecimalFormat("0000.00");
			formattedStrikPrice = format.format(bdStrike.getBigDecimal());
			formattedStrikPrice = formattedStrikPrice.replace(new RegExp('\\.', 'g'), '');
		}
		return formattedStrikPrice;
	}
}

var ExchangeRicSuffix_LondonLSE_Options = function (){
	var description = function(){return "The exchangeRICSuffix is '.LL' if SECURITY_TYP=’Equity Option’";}

	this.calculate = function(vars){
		var exchangeRicSuffix = "";
		if("Equity Option" == vars.record.SECURITY_TYP || "Index Option" == vars.record.SECURITY_TYP) exchangeRicSuffix=".LL";
		return exchangeRicSuffix;
	}
}


var FormatStrikePrice_TaiwanTIM_Options =  function (){
	this.getDescription = function(){return "Formated Strike Price for TaiwanTIM_Options.";}

	this.calculate = function(vars){
		var secTyp = vars.record.SECURITY_TYP;
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
		var formattedStrikPrice="";
		if("Equity Option" == secTyp){
			formattedStrikPrice=JRulesOptionsExt.formatStrikePriceForRic(vars.formattedStrikePrice,vars.optionOnFuture=="Y",vars);
		}else if("Index Option" == secTyp || "Physical commodity option." == secTyp ){
			if(bdStrike.getBigDecimal().precision() - bdStrike.getDP()>=4  ||
				"TFO" == vars.record.ID_EXCH_SYMBOL	){
				formattedStrikPrice =  bdStrike.setDP(0).removeDP().toString();
			}else
				formattedStrikPrice = JRulesOptionsExt.formatStrikePriceForRic(vars.formattedStrikePrice,vars.optionOnFuture=="Y",vars);
		}else if("Currency option." == secTyp){
			formattedStrikPrice = bdStrike.setDP(2).removeDP().toString();
		}else throw new Error("Undefined format for strike price!");
		return formattedStrikPrice;
	}
}

var ChainRic_TaiwanTIM_Options = function (){
	this.getDescription = function(){return "ChainRic for TaiwanTIM_Options";}
	this.calculate = function(vars){
		var chainRic = vars.chainRic;
		var index=chainRic.indexOf("W*");
		if(index>0 && ApacheStringUtils.isNumeric(chainRic.substring(index-1,index))){
			chainRic = chainRic.substring(0,index-1)+chainRic.substring(index,index+2)+vars.putCall+chainRic.substring(index+2);
		}
		return chainRic;
	}
}

var ChainRic_TaiwanTIMPC_Options = function (){
	this.getDescription = function(){return "ChainRic for TaiwanTIM_Options";}
	this.calculate = function(vars){
		var chainRic = vars.record.CHAINRIC_X;
		var index=chainRic.indexOf("W*");
		if(index>0 && (chainRic.substring(index+2,index+3)=="C"  || chainRic.substring(index+2,index+3)=="P")){
			chainRic = chainRic.substring(0,index+2)+chainRic.substring(index+3);
		} else {
			return null;
		}
		vars.record.CHAINRIC_X = chainRic;
		return vars.record;
	}
}


var L2_InsertPrefix = function(){
	this.getDescription = function(){return "add a PREFIX before the sufix ('.XX')";}

	this.calculate = function(vars,args){
		var ric = vars.ric;
		var record = vars.record;

		record.SYMBOL = vars.symbol+'?level=2';
		var ricRoot = ric.substring(0,ric.indexOf("."));
		var ricSufix = ric.substring(ric.indexOf("."));

		record.RIC= ricRoot+args.prefix+ricSufix
		return JArrays.asList(record);
	}
}
var L2_AddPrefix = function(){
	this.getDescription = function(){return "add a PREFIX ";}

	this.calculate = function(vars,args){
		var ric = vars.ric;
		var record = vars.record;
		record.SYMBOL = vars.symbol+'?level=2';
		record.RIC= args.prefix+ric;
		return JArrays.asList(record);
	}
}
var L2_AddSuffix = function(){
	this.getDescription = function(){return "add a SUFFIX ";}

	this.calculate = function(vars,args){
		var ric = vars.ric;
		var record = vars.record;

		record.SYMBOL = vars.symbol+'?level=2';
		record.RIC= ric+args.suffix;
		return JArrays.asList(record);
	}
}

var L2_AddTickerSuffix = function() {
	this.getDescription = function(){return "add a suffix to ticker (before .<venue>) ";}

	this.calculate = function(vars,args){
		var ric = vars.ric;
		var record = vars.record;

		record.SYMBOL = vars.symbol+'?level=2';

		var idx = ric.lastIndexOf(".");
		if (idx>=0)
			record.RIC=ric.substring(0,idx)+args.suffix+ric.substring(idx,ric.length);
		else
			record.RIC=ric+args.suffix;
		return JArrays.asList(record);
	}
}

var Ric_BombayBSE_Futures = function() {
	var description = function() {
		return "FUT_TRADING_SESSION->RIC_prefix: N->'1',D->'2',B->''. The exchangeRICSuffix is ':BO' UNLESS SECURITY_TYP contains the word 'index' ";
	}

	this.calculate = function(vars) {
		var exchangeRicSuffix = ":BO";
		if (vars.record.SECURITY_TYP.indexOf("index")>-1) exchangeRicSuffix = "";
		var prefix = '';
		var futureTradingSession = vars.futureTradingSession;
		if (futureTradingSession != null) {
			if (futureTradingSession == 'N')
				prefix = '1';
			else if (futureTradingSession == 'D'
					&& vars.symbol.indexOf(" PIT ") > 0)
				prefix = '2';
		}
		return prefix + vars.ric + exchangeRicSuffix;

	}
}

var FormatStrikePrice_GreeceADE_Options =  function (){
	this.getDescription = function(){return "Formated Strike Price for GreeceADE_Options.";}

	this.calculate = function(vars){
		var secTyp = vars.record.SECURITY_TYP;
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
		var formattedStrikPrice="";
		if("Index Option" == secTyp){
			formattedStrikPrice =  bdStrike.setDP(0).removeDP().toString();
		}else{
			bdStrike = bdStrike.multiply(JBigDecimal.valueOf("100"));
			formattedStrikPrice = bdStrike.setDP(0).removeDP().toString();
		}
		return formattedStrikPrice;
	}
}

var Filter_SydneySFE_Spreads_cSFE = function (){
	this.getDescription = function(){return "Include if cSFE or PK without PIT";}
	this.calculate = function(vars) {
		if (vars.record.FEED_SOURCE==null || vars.record.FEED_SOURCE=="") return "FEED_SOURCE not defined";
		if (vars.record.FEED_SOURCE=="cSFE") return null; // do not filter out
		if (vars.record.FEED_SOURCE=="SFE" && vars.record.PARSEKYABLE_DES_SOURCE.indexOf(" PIT ")<0) return null; // do not filter out
		return "FEED_SOURCE not cSFE and SFE PARSEKYABLE_DES_SOURCE not PIT";
	}
}

var Ric_SpreadSydneySFE = function (){
	this.getDescription = function(){return "Spread RIC rule for Sydney SFE";}
	this.calculate = function(vars) {

		var exchangeSymbol = vars.record.ID_EXCH_SYMBOL;
		var fullExchangeSymbol = vars.exchangeSymbol;

		if(exchangeSymbol.indexOf('_')<0){
			fullExchangeSymbol = fullExchangeSymbol.substring(fullExchangeSymbol.length()-4);
			var monthYearCode1 = fullExchangeSymbol.substring(0,2);
			var monthYearCode2 = fullExchangeSymbol.substring(fullExchangeSymbol.length()-2);
			return vars.ricRoot+monthYearCode1+"-"+monthYearCode2;
		}else{
			var bbgRoot1 = vars.bbgRoot;
			var bbgRoot2 = vars.record.BBG_ROOT2_X;
			if(bbgRoot2==null)throw "BBG_ROOT2_X is not defined!";

			var masterTable = vars.masterTable;
			var masterRecord1 = masterTable.getMasterRecord((new JDBCField("BBG_ROOT")).eq(new JDBCField(bbgRoot1)).and((new JDBCField("BBG_FEED_SOURCE")).eq(vars.record.FEED_SOURCE)).
					and((new JDBCField("BBG_ASSET_CATEGORY")).eq(vars.record.BBG_ASSET_CATEGORY_X)));
			if (masterRecord1==null) throw "Master record not found for BBG_ROOT:"+bbgRoot1+", BBG_FEED_SOURCE:"+vars.record.FEED_SOURCE+",BBG_ASSET_CATEGORY:"+vars.record.BBG_ASSET_CATEGORY_X;

			var masterRecord2 = masterTable.getMasterRecord((new JDBCField("BBG_ROOT")).eq(new JDBCField(bbgRoot2)).and((new JDBCField("BBG_FEED_SOURCE")).eq(vars.record.FEED_SOURCE)).
					and((new JDBCField("BBG_ASSET_CATEGORY")).eq(vars.record.BBG_ASSET_CATEGORY_X)));
			if (masterRecord2==null) throw "Master record not found for BBG_ROOT:"+bbgRoot2+", BBG_FEED_SOURCE:"+vars.record.FEED_SOURCE+",BBG_ASSET_CATEGORY:"+vars.record.BBG_ASSET_CATEGORY_X;

			var rr1=masterRecord1.RIC_ROOT;
			var rr2=masterRecord2.RIC_ROOT;
			vars.record.RICROOT2_X=rr2;

			var monthYearCode1 = fullExchangeSymbol.substring(2,4);
			var monthYearCode2 = fullExchangeSymbol.substring(6,8);
			var suffix = fullExchangeSymbol.substring(8);

			return rr1+monthYearCode1+"-"+rr2+monthYearCode2+"-"+suffix;
		}
	}
}


var Ric_SpreadKoreaKFE = function (){
	this.getDescription = function(){return "Spread RIC rule for Korea KSC";}
	this.calculate = function(vars) {
		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);
		if(monthYearCode1==monthYearCode2)throw "CURRENT_CONTRACT_MONTH_YR: monthYearCode1 == monthYearCode2!";

		return vars.ricRoot+monthYearCode1+"-"+monthYearCode2;
	}
}

var Ric_SpreadKoreaKFE_SSF = function (){
	this.getDescription = function(){return "Spread RIC rule for Korea KSC SSF";}
	this.calculate = function(vars) {
		if(vars.record.PARSEKYABLE_DES_SOURCE==null)throw "PARSEKYABLE_DES_SOURCE  is null!";
		var tokens = vars.record.PARSEKYABLE_DES_SOURCE.split(" ");
		if(tokens.length != 4) throw ".PARSEKYABLE_DES_SOURCE  can not split in 4 values!";
		var monthYearCode1 = tokens[1].substring(0,1)+tokens[1].substring(2,3);
		var monthYearCode2 = tokens[1].substring(3,4)+tokens[1].substring(5,6);

		return vars.ricRoot+monthYearCode1+"-"+monthYearCode2+":KE";
	}
}

var ChainRic_BMESpainMRV_RICExtension = function (){
	this.getDescription = function(){return ".i RIC extension ";}
	this.calculate = function(vars){

		return vars.chainRic+".i";
	}
}

var MasterRecordFind_NymexNYM_Spreads = function (){
	this.getDescription = function(){return "";}
	this.calculate = function(vars){
		// Nymex spreads are not consistentently assigned feed source
		// we can have situation that non ELEC record has eNYM source
		// Currently we support only one feed source for Nymex, but that can be any of the three.
		// If feeds source is ACTIV for a spread record then we should as well use it,
		// If it is not ACTIV then we can check if there is a mismatch between source symbol and the feed source
		var masterTable = vars.masterTable;
		var feedSource = vars.record.FEED_SOURCE;
		var masterRecord = masterTable.getMasterRecord((new JDBCField("TICKER")).eq(new JDBCField(vars.ticker)).and((new JDBCField("FEED_SOURCE")).eq(feedSource)));
//		jprint("Search1 for MT, Ticker="+vars.ticker+", FeedSource="+feedSource+", found="+(masterRecord!=null));
		if (masterRecord==null) {
			var symbol = vars.record.PARSEKYABLE_DES_SOURCE;
			if (symbol.indexOf("ELEC")<0 && feedSource.startsWith("e")) {
				feedSource = "c"+feedSource.substring(1);
				masterRecord = masterTable.getMasterRecord((new JDBCField("TICKER")).eq(new JDBCField(vars.ticker)).and((new JDBCField("FEED_SOURCE")).eq(feedSource)));
//				jprint("Search2 for MT, Ticker="+vars.ticker+", FeedSource="+feedSource+", found="+(masterRecord!=null));
			}
		}
		return masterRecord;
	}
}

var Ric_SpreadCME= function (){
	this.getDescription = function(){return "Spread RIC rule for Chicago CME";}
	this.calculate = function(vars) {
		var y=(new Date().getFullYear()).toString().substring(3);//last year digit

		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);
		if(monthYearCode1==monthYearCode2)throw "CURRENT_CONTRACT_MONTH_YR: monthYearCode1 == monthYearCode2!";
		//jprint(monthYearCode1);
		//jprint(monthYearCode2);
		var monthCode1=monthYearCode1.substring(0,1);
		var yearCode1=monthYearCode1.substring(1);
		var monthCode2=monthYearCode2.substring(0,1);
		var yearCode2=monthYearCode2.substring(1);

		if(yearCode1.length==1 && yearCode1> 3 && yearCode1 < y)yearCode1="2"+yearCode1;
		if(yearCode2.length==1 && yearCode2> 3 &&
				(yearCode2 < y || (yearCode2 >= y && yearCode1.length==2))) yearCode2="2"+yearCode2;

		//remove inverted spreads
		//var c1 = (yearCode1.length==2?yearCode1:(yearCode1<4?"2"+yearCode1:"1"+yearCode1))+monthCode1;
		//var c2 = (yearCode2.length==2?yearCode2:(yearCode2<4?"2"+yearCode2:"1"+yearCode2))+monthCode2;
		//if(c1<c2)
			return vars.ricRoot+monthCode1+yearCode1+"-"+monthCode2+yearCode2;
		//else
			//return vars.ricRoot+monthCode2+yearCode2+"-"+monthCode1+yearCode1;
	}
}

var ExtraRICCode_MonthlySerialCRics = function (){
	this.getDescription = function(){return "Adding 'qky' continuation RICs";}
	this.calculate = function(vars) {

		var ric = vars.ric;
		var i = ric.lastIndexOf("c");
		if (i<=0)
			throw new "'continuation' RIC does not contain 'c': "+ric;
		var record = new JRecord(vars.record);
		record.RIC_X = ric.substring(0,i+1)+'m'+ric.substring(i+1,ric.length);
		record.BBGPREFIX_X = JBBGRecordCreator.qkyPrefix;
		return new JRecordList(record);
	}
}

var ExtraRICCode_MonthlySerialCRics_LME = function (){
	tikcer2SR_YD = {
    		'SN':['LT',1],
    		'AA':['LY',1],
    		'CA':['LP',2],
    		'AH':['LA',2],
    		'NI':['LN',1],
    		'ZS':['LX',1],
    		'PB':['LL',1],
    		'NA':['LK',1],
    		'MO':['MOL',1],
    		'CO':['LCO',1],
    		'AG':['LWA',1],
    		'AU':['LQA',1]
		};
	function createChain(vars,ric,symbol,chainRic,putInStore){
		var record = new JRecord(vars.record);
		record.RIC_X = ric;
		record.SYMBOL_X=symbol;
		if(putInStore)vars.tempLinkStore.put(ric+symbol, record);

		if(chainRic==null || chainRic.length==0) throw "Empty chainRic field!";
		vars.chains.addNewSymbol(chainRic, vars.record.RICROOT_X,ric+symbol, ric).addMasterId(vars.record.MASTER_RECORD_ID_X);
	}
	this.getDescription = function(){return "Adding continuation RICs";}
	this.calculate = function(vars) {
		var cRic = vars.ric;
		var record = new JRecord(vars.record);
		var i = cRic.lastIndexOf("c");
		if (i<=0)
			throw new "'continuation' RIC does not contain 'c': "+ric;
		var cSymbol = record.SYMBOL_X;
		var tickerx = record.TICKER_X;

		var exchangeSymbol = record.ID_EXCH_SYMBOL;
		var ricRoot = record.RICROOT_X;
		var feedSource = record.FEED_SOURCE;
		var fullExchangeSymbol = record.ID_FULL_EXCHANGE_SYMBOL;
		var futureDate = fullExchangeSymbol.substring(fullExchangeSymbol.length-8,fullExchangeSymbol.length);
		var monthYearCode = record.FUT_MONTH_YR_CODE_X;
		var symbolTokens = record.SYMBOL_X.split(" ");
	    var suffix = symbolTokens[symbolTokens.length - 1];	// last word in the symbol

	    var baseSymbol=tikcer2SR_YD[tickerx][0]+monthYearCode.substring(0,1)+monthYearCode.substring(monthYearCode.length-tikcer2SR_YD[tickerx][1]);
		var extraRecords=new JArrayList();

		var mRic = ricRoot+monthYearCode;
		var mSymbol = baseSymbol+" "+suffix;
		var lmesSymbol = "LM"+exchangeSymbol+"DP "+futureDate+" "+"LMES"+" "+suffix;

		//2. this is 3.
		var ric = mRic;
		var symbol = mSymbol;
		var isDouble=!vars.validator.checkDuplicatedRICs(ric,symbol);
		if(isDouble==false){
			extraRecords.add(new JRecord(record,"RIC_X",ric,"SYMBOL_X",symbol));
			createChain(vars, ric, symbol, ricRoot+":",true);
		}
		//3. this is 2.
		var ric = "C"+cRic;
		var symbol = cSymbol;
		isDouble=!vars.validator.checkDuplicatedRICs(ric,symbol);
		if(isDouble==false){
			extraRecords.add(new JRecord(record,"RIC_X",ric,"SYMBOL_X",symbol));
		}
		//4.
		var ric = "C"+mRic;
		var symbol = mSymbol;
		isDouble=!vars.validator.checkDuplicatedRICs(ric,symbol);
		if(isDouble==false){
			extraRecords.add(new JRecord(record,"RIC_X",ric,"SYMBOL_X",symbol));
			createChain(vars,ric,symbol,"C"+ ricRoot+":",true);
		}
		//5.
		var ric = mRic+"=LX";
		var symbol = lmesSymbol;
		isDouble=!vars.validator.checkDuplicatedRICs(ric,symbol);
		if(isDouble==false){
			extraRecords.add(new JRecord(record,"RIC_X",ric,"SYMBOL_X",symbol));
		}
		return extraRecords;
	}
}

var Ric_IstanbulIST = function (){
	this.getDescription = function(){return "Adding continuation RICs";}
	this.calculate = function(vars) {
		if(!vars.isGeneric)return vars.ric;
		var ric = vars.ric;
		var i = ric.lastIndexOf("c");
		if (i<=0)
			throw new "'continuation' RIC does not contain 'c': "+ric;
		var cn=ric.substring(i+1,ric.length);
		ric = ric.substring(0,i+1)+cn.substring(cn.length-1);
		return ric;
	}
}

var Ric_SpreadCboeCBF = function (){
	this.getDescription = function(){return "Spread RIC rule for Cboe CBF";}
	this.calculate = function(vars) {
		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);
		if(monthYearCode1==monthYearCode2)throw "CURRENT_CONTRACT_MONTH_YR: monthYearCode1 == monthYearCode2!";

		return vars.ricRoot+"S"+monthYearCode1+"-"+"B"+monthYearCode2;
	}
}

var Filter_In_GermanySTU_Equities = function (){
	this.getDescription = function(){return "Include if  ID_MIC_LOCAL_EXCH = XSTU OR ID_MIC1 = XSTU";}
	this.calculate = function(vars){
		if("XSTU"==vars.record.ID_MIC_LOCAL_EXCH || "XSTU"==vars.record.IID_MIC1)return null;
		return "ID_MIC_LOCAL_EXCH != XSTU AND ID_MIC1 != XSTU";
	}
}

var ChainRic_SpreadHongKongHFE_RICExtension = function (){
	this.getDescription = function(){return "SPD RIC extension ";}
	this.calculate = function(vars){
		var chain = vars.chainRic;
		var pos=chain.indexOf("-:");
		if(pos > -1)chain=chain.substring(0,pos+1)+"SPD"+chain.substring(pos+1);
		return chain;

	}
}

var ChainRic_SpreadSingaporeSIM_RICExtension = function (){
	this.getDescription = function(){return "SPD RIC extension ";}
	this.calculate = function(vars){
		var chain = vars.chainRic;
		var pos=chain.indexOf("-:");
		if(pos > -1)chain=chain.substring(0,pos+1)+"SPD"+chain.substring(pos+1);
		return chain;

	}
}


var Year1DCode_Futures = function Year1DCode_Futures(){
	var description = "One digit year code.";

	this.calculate = function(vars){
		var t=vars.futureMonthYear.replace(new RegExp(' ', 'g'), '').replace(new RegExp('-', 'g'), '');
		t=t.substring(3,5);
		t=t.substring(1);
		return t;
	}
	this.getDescription = function(){return description;}
}

var Filter_In_SingaporeSIM_Spreads = function (){
	this.getDescription = function(){return "include if FEED_SOURCE=SGX and ID_EXCH_SYMBOL=NS";}
	this.calculate = function(vars){
		if("cSGX"==vars.record.FEED_SOURCE) return null;
		else if("SGX"==vars.record.FEED_SOURCE && "NS"==vars.record.ID_EXCH_SYMBOL)return null;
		return "FEED_SOURCE != SGX OR ID_EXCH_SYMBOL != NS";
	}
}

var L2_XetraGER_Equity = function(){
	this.getDescription = function(){return "L2 XetraGER_Equity if ric ends with '.DE': RICd->SYM'?level=2' + 1RIC->sSYM";}

	this.calculate = function(vars){
		var ric = vars.ric;
		var records = new JArrayList();
		if(ric.endsWith('.DE')){
			var record = vars.record;
			record.SYMBOL = vars.symbol+'?level=2';
			record.RIC= '1'+ric;
			records.add(record);
		}
		return records;
	}
}


var Ric_TaiwanTIM = function (){
	this.getDescription = function(){return "Spread RIC rule for Taiwan TIM";}
	this.calculate = function(vars) {

		var ricPrefix='';
		if('N'==vars.record.FUT_TRADING_SESSION )ricPrefix='1';
		else if('D'==vars.record.FUT_TRADING_SESSION  && vars.symbol.indexOf(' PIT ')>=0)ricPrefix='2';
		return ricPrefix+vars.ric;
	}
}

var ChainRic_SpreadSydneySFE_RICExtension = function (){
	this.getDescription = function(){return "SPD RIC extension ";}
	this.calculate = function(vars){
		var chain = vars.chainRic;
		var ricRoot2 = vars.record.RICROOT2_X;
		if(ricRoot2==null)ricRoot2="";
		var pos=chain.indexOf("-:");
		if(pos > -1)chain=chain.substring(0,pos)+ricRoot2+"-"+"SPD"+chain.substring(pos+1);
		else chain+=ricRoot2;
		return chain;

	}
}

var Filter_In_SingaporeSIM_Options = function (){
	this.getDescription = function(){return "Include if ID_EXCH_SYMBOL = ED OR FEED_SOURCE = cSGX";}
	this.calculate = function(vars){
		if("ED"==vars.record.ID_EXCH_SYMBOL || "cSGX"==vars.record.FEED_SOURCE)return null;
		return "ID_EXCH_SYMBOL != ED AND FEED_SOURCE != cSGX";
	}
}

var RMSCode_From_PARSEKYABLE = function(){
	this.getDescription = function(){return "rmsCode from PARSEKYABLE_DES_SOURCE.";}

	this.calculate = function(vars){
		if(vars.rmsCode.indexOf(' ')<0) return vars.rmsCode;
		var token = vars.rmsCode.split(' ');
		return token[0];
	}
}

var Ric_From_ExchangeSymbol_And_Sufix = function (){

	this.getDescription = function(){return "RIC = EXCHANGE_SYMBOL+Suffix";}


	this.calculate = function(vars,args){
		var ric = vars.record.EXCHANGE_SYMBOL;
		return ric+args.suffix;
	}
}

var Ric_NomuraIND_Index = function Ric_NomuraIND_Index(){
	var description = function(){return "Take all the characters up to the space in the PARSEKYABLE_DES_SOURCE, and add dot prefix.";}

	this.calculate = function(vars){
		var symbol = vars.record.SYMBOL_X;
		if(symbol.indexOf(' ')>-1)
			return '.'+symbol.substring(0,symbol.indexOf(' '));
		else
			throw new Error("PARSEKYABLE_DES_SOURCE is not in expected format!");
		return null;
	}
}

var Ric_NomuraCarryEdge_Index = function (){
	var description = function(){return "";}
	this.calculate = function(vars){
		return "."+vars.record.ID_BB_SEC_NUM_DES;
	}
}

var Ric_AddSuffix = function (){
	this.getDescription = function(){return "Add suffix to ric.";}

	this.calculate = function(vars,args){
		return vars.ric+args.suffix;
	}
}

var Ric_AddSuffixOX = function (){
	this.getDescription = function(){return "Add ':OX' to ric.";}

	this.calculate = function(vars){
		return vars.ric+':OX';
	}
}

var Ric_CBBT_Bonds = function (){
	this.getDescription = function(){return "Format ric as: ISIN=FEED_SOURCE";}
	this.calculate = function(vars){
		return vars.record.ID_ISIN+"="+vars.record.FEED_SOURCE;
	}
}

var Ric_CBBT_CUSIP_Bonds = function (){
	this.getDescription = function(){return "Format of RIC is XXXXccyy=DMO ";}
	this.calculate = function(vars){
		return vars.record.ID_CUSIP+"=CBBT";
	}
}

var Ric_TWFT_Bonds = function (){
	this.getDescription = function(){return "Format of RIC is XXXXccyy=DMO ";}
	this.calculate = function(vars){
		return vars.record.ID_ISIN+"=TWFT";
	}
}

var Ric_TWTSY_Bonds = function (){
	this.getDescription = function(){return "Format of RIC is isin.substring(5,11)=TWO";}
	this.calculate = function(vars){
		var isin =  vars.record.ID_ISIN;
		if (!isin.startsWith("TW000")) throw "ID_ISIN does not start with TW000";

		vars.record.SYMBOL_X = vars.record.SYMBOL_X.replace("@NEGO","@TOTC");

		// set sorting
		var daysToMaturaty = vars.record.DAYS_TO_MTY_TDY;
		if (daysToMaturaty==null || daysToMaturaty.length==0) daysToMaturaty = "9999999999";
		while (daysToMaturaty.length<10) daysToMaturaty="0"+daysToMaturaty;
		// as there are some records with the same numbers of days to maturaty add something else to keep them in the same order between two runs
		vars.record.CHAIN_SORT_VALUE_X = daysToMaturaty+vars.record.SYMBOL_X;

		// return RIC
		return isin.substring(5,11)+"=TWO";
	}
}


var L2_TWTSY_Bonds = function (){
	this.getDescription = function(){return "replace RIC SUFFIX with =BST";}

	this.calculate = function(vars,args){
		var record = vars.record;
		if (!record.RIC.indexOf("=TWO")>0) throw "RICdoes not end with =BST";
		record.SYMBOL = vars.record.SYMBOL+'?level=2';
		record.RIC = vars.record.RIC.replace("=TWO","=BST")
		return JArrays.asList(record);
	}
}


var ChainRic_CBBT_CUSIP_Bonds = function (){
	this.getDescription = function() { return "No chain creation!"; }

	this.calculate = function(vars){
		if (vars.ricRoot==null) return null;
		return vars.ricRoot+"_CUSIP";
	}
}

var Ric_DOM_Bonds = function (){
	this.getDescription = function(){return "Format of RIC is XXXXccyy=DMO ";}
	var ccCalc = {
		    '125':'E',
		    '25':'Q',
		    '375':'R',
		    '5':'H',
		    '625':'F',
		    '75':'T',
		    '875':'S'
			};
	this.calculate = function(vars){
		var source=vars.record.ID_BB_SEC_NUM_DES;
		var tokens = source.split(' ');
		if(tokens.length<3)throw new Error("ID_BB_SEC_NUM_DES has wrong format!");

		var ricRoot=null;
		if('UKT'==tokens[0])ricRoot='GBT';
		else if('UKTB'==tokens[0])ricRoot='UKTB';
		else if('UKTI'==tokens[0])ricRoot='GBIL';
		else throw new Error("Security not supported, ID_BB_SEC_NUM_DES="+tokens[0]);

		var cc = "";
		var tokenscc =  tokens[1].split('.');
		if(tokenscc.length==1) cc=tokens[1];
		else{
			cc=ccCalc[tokenscc[1]];
			if(cc=='undefined' || cc==null) throw new Error("Undefined decimal point mapping for "+tokens[1]);
			cc=tokenscc[0]+cc;
		}

		var dateTokens = tokens[2].split('/');
		if (dateTokens.length!=3) throw new Error("Unexpected date format "+tokens[2]);
		var dateStr=dateTokens[2];
		if ('UKTB'==ricRoot) {
			dateStr="20"+dateTokens[2]+dateTokens[0]+dateTokens[1];
			cc="";
		}

		return ricRoot+cc+dateStr+"=DMO";

	}
}
var ChainRic_DOM_Bonds = function (){
	this.getDescription = function(){return "No chain creation!";}

	this.calculate = function(vars){
		return null;
	}
}
var L2_AddSuffixNYS = function(){
	this.getDescription = function(){return "add a SUFFIX ";}

	this.calculate = function(vars,args){
		var ric = vars.ric;
		if(!ric.endsWith('.N'))return;
		var record = vars.record;
		record.SYMBOL = vars.symbol+'?level=2';
		record.RIC= ric+args.suffix;
		return JArrays.asList(record);
	}
}

var Ric_SpreadMilanMIL = function (){
	this.getDescription = function(){return "Spread RIC rule for Milan MIL";}
	this.calculate = function(vars) {
		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);
		if(monthYearCode1==monthYearCode2)throw "CURRENT_CONTRACT_MONTH_YR: monthYearCode1 == monthYearCode2!";

		var ricPrefix='';
		return ricPrefix+vars.ricRoot+monthYearCode1+"-"+monthYearCode2;
	}
}

var Ric_SpreadIceIUS = function (){
	this.getDescription = function(){return "Spread RIC rule for Ice IUS";}
	this.calculate = function(vars) {
		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);
		if(monthYearCode1==monthYearCode2)throw "CURRENT_CONTRACT_MONTH_YR: monthYearCode1 == monthYearCode2!";

		var ricPrefix='';
		if (vars.record.FUTURES_CATEGORY=="Cross Currency" || vars.record.FUTURES_CATEGORY=="Equity Index" )
			return ricPrefix+vars.ricRoot+monthYearCode2+"-"+monthYearCode1;
		else
			return ricPrefix+vars.ricRoot+monthYearCode1+"-"+monthYearCode2;
	}
}

var Ric_SpreadBMESpainMRV = function (){
	this.getDescription = function(){return "Spread RIC rule for Spain MRV";}
	this.calculate = function(vars) {
		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);

		var ricPrefix='';
		return ricPrefix+vars.ricRoot+monthYearCode1+"-"+monthYearCode2;
	}
}

var Ric_Spread2MonthYearCode = function (){
	this.getDescription = function(){return "Spread RIC rule for Spain MRV";}
	this.calculate = function(vars) {
		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);
		if(monthYearCode1==monthYearCode2)throw "CURRENT_CONTRACT_MONTH_YR: monthYearCode1 == monthYearCode2!";

		return vars.ricRoot+monthYearCode1+"-"+monthYearCode2;
	}
}

var FormatStrikePrice_IstanbulIST =  function (){
	this.getDescription = function(){return "Formated Strike Price IstanbulIST";}

	this.calculate = function(vars){
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice).stripTrailingZeros();
		bdStrike = bdStrike.multiply(100).setDP(0).removeDP();
		return bdStrike.toString();
	}
}

var Ric_SpreadEuronext = function (){
	this.getDescription = function(){return "Spread RIC rule for Euronext";}
	this.calculate = function(vars) {
		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);
		if(monthYearCode1==monthYearCode2)throw "CURRENT_CONTRACT_MONTH_YR: monthYearCode1 == monthYearCode2!";

		return vars.ricRoot+monthYearCode1+"-"+monthYearCode2;
	}
}

var CreatXRicMap_KLS = function (){
	this.getDescription = function(){return "Spread RIC rule for MontrealMON";}

	var suffixes = ["_t","_ta","_tb","_tc","_td","_tf","_te","_th","_tg","_tj","_tk","_tl","_ti","_tm","_tn","_to","_tq","_tw","_tt","_tp","_tv","_tz","_tr","_ty","_ts","_tu","_tx"];

	this.calculate = function(vars) {
		var ric = vars.ric;
		for (var suffix in suffixes) {
			var newMap = JSON.parse(JSON.stringify(vars.map[0]));
			var ricRoot = ric.substring(0,ric.indexOf("."));
			var ricSufix = ric.substring(ric.indexOf("."),ric.length);
			newMap["RIC"]=ricRoot+suffix+ricSufix;
			vars.map.push(newMap);
		}
		return vars.map;
	}
}

var Ric_Bonds_HKG = function () {
	this.getDescription = function(){return "";}
	this.calculate = function(vars) {
		return vars.record.ID_ISIN+"=HKSE";
	}
}


var RicRoot_LondonLME_Options = function RicRoot_LondonLME_Options(){
	this.getDescription = function(){return "If OPT_EXER_TYP = European then add 't' suffix to RIC root ";}

   this.calculate = function(vars){
	   var expType = vars.record.OPT_EXER_TYP;
	   var ricRoot = vars.ricRoot;

	   if ("European"==expType)   ricRoot += "t";

	   return ricRoot;
	}
}

var Filter_LondonLME_3MForward_Spreads = function (){
	this.getDescription = function(){return "";}

	this.calculate = function(vars){
	   var symbol = vars.record.PARSEKYABLE_DES_SOURCE;
	   var ricRoot = vars.ricRoot;
	   var tokens = symbol.split(" ");
	   if (tokens.length!=4) return "PARSEKYABLE_DES_SOURCE can not be split into 4 tokens";
		var fullExcSymbol = vars.record.ID_FULL_EXCHANGE_SYMBOL;
		tokens = fullExcSymbol.split("_");
		if (tokens.length!=4) return "ID_FULL_EXCHANGE_SYMBOL can not be split into 4 tokens,"+fullExcSymbol;
		if (tokens[1]!="3M") return "ID_FULL_EXCHANGE_SYMBOL second token is not '3M'";
	   return null;
	}
}

var ExpirationDate_LondonLME_3MForward_Spreads = function (){
	this.getDescription = function(){return "";}
	this.calculate = function(vars){
		var excSymbol = vars.record.ID_EXCH_SYMBOL;
		var fullExcSymbol = vars.record.ID_FULL_EXCHANGE_SYMBOL;
		var tokens = fullExcSymbol.split("_");
		if (tokens.length!=4) throw "ID_FULL_EXCHANGE_SYMBOL can not be split into 4 tokens,"+fullExcSymbol;
		if (tokens[0]!=excSymbol) throw "ID_FULL_EXCHANGE_SYMBOL does not start with ID_EXCH_SYMBOL";
		var expirationDate;
		if (tokens[1]=="3M") {
			expirationDate = tokens[3];
		} else {
			expirationDate = tokens[1];
		}
		if (expirationDate.length!=8) throw "Date in the ID_FULL_EXCHANGE_SYMBOL is not 8 chars long,"+expirationDate;
		return expirationDate;
	}
}

var Ric_LondonLME_3MForward_Spreads = function (){
	this.getDescription = function(){return "";}

	this.calculate = function(vars){
	   var symbol = vars.record.PARSEKYABLE_DES_SOURCE;
	   var ricRoot = vars.ricRoot;
	   var tokens = symbol.split(" ");
	   if (tokens.length!=4) throw "PARSEKYABLE_DES_SOURCE can not be split into 4 tokens,"+symbol;
	   var monthYearCode = tokens[1].substring(tokens[1].length-3,tokens[1].length);
	   var ric = "C"+ricRoot+"3-"+monthYearCode;
	   return ric;
	}
}

var ExtraRICCode_LondonLME_3MForward_Spreads = function (){

	function createChain(vars,ric,symbol,chainRic,putInStore){
		var record = new JRecord(vars.record);
		record.RIC_X = ric;
		record.SYMBOL_X=symbol;
		if(putInStore)vars.tempLinkStore.put(symbol, record);

		if(chainRic==null || chainRic.length==0) throw "Empty chainRic field!";
		vars.chains.addNewSymbol(chainRic,vars.record.RICROOT_X, symbol,ric);
	}
	this.getDescription = function(){return "";}
	this.calculate = function(vars) {
		var record = new JRecord(vars.record);
		var ric = record.RIC_X;
		if (!ric.startsWith("C"))
			throw new "RIC does not starts with 'C': "+ric;
		ric = ric.substring(1);

		var symbol = vars.symbol;
		var ricRoot = record.RICROOT_X;
		var extraRecords=new JArrayList();
		var isGeneric = record.SECURITY_TYP.toLowerCase().contains("generic");

		// 1) the RIC without the "C" prefix and the SYMBOL has the PCS changed from "LME" to "LMEI"
		// This is the Interoffice/broker RIC
		var mRic = ric;
		var mSymbol = symbol.replace("LME","LMEI");
		var isDouble=!vars.validator.checkDuplicatedRICs(mRic,mSymbol);
		if(isDouble==false){
			extraRecords.add(new JRecord(record,"RIC_X",mRic,"SYMBOL_X",mSymbol));
			if(!isGeneric)createChain(vars, mRic, mSymbol, ricRoot + "-:",true);
		}

		// 2) the RIC without the "C" prefix but with "=LX" suffix and the SYMBOL has the PCS changed from "LME" to "LMES"
		//This is the LME Select (electronic) RIC
		mRic = ric+"=LX";
		mSymbol = symbol.replace("LME","LMES");
		var isDouble=!vars.validator.checkDuplicatedRICs(mRic,mSymbol);
		if(isDouble==false){
			extraRecords.add(new JRecord(record,"RIC_X",mRic,"SYMBOL_X",mSymbol));
			if(!isGeneric)createChain(vars, mRic, mSymbol, ricRoot + "-:",true);
		}

		return extraRecords;
	}
}

var Ric_TokyoTYO_Equity = function Ric_TokyoTYO_Equity(){

	this.getDescription = function(){return "RIC = EXCHANGE_SYMBOL+Suffix(FEED_SOURCE)";}


	this.calculate = function(vars,args){
		var ric = vars.record.ID_EXCH_SYMBOL;
		if (ric==null || ric.length==0){
			var symbol = vars.record.PARSEKYABLE_DES_SOURCE;
			if(symbol.indexOf(' ')>-1)
				ric=symbol.substring(0,symbol.indexOf(' '));
			else
				throw new Error("PARSEKYABLE_DES_SOURCE is not in expected format!");
		}
		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource==null || feedSource.length==0)
			throw "FEED_SOURCE not defined";
		var suffix = null;
		if ("JT"==feedSource)
			suffix="T";
		if ("JF"==feedSource)
			suffix="FU";
		if ("JS"==feedSource)
			suffix="SP";
		if (suffix==null)
			throw "Suffix not defined for FEED_SOURCE="+feedSource;
		if (suffix.length()>0)
			ric+=("."+suffix);
		return ric;
	}
}

var Ric_SpreadIceIEU = function (){
	this.getDescription = function(){return "Spread RIC rule for IceIEU";}
	this.calculate = function(vars) {
		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);
		if(monthYearCode1==monthYearCode2)throw "CURRENT_CONTRACT_MONTH_YR: monthYearCode1 == monthYearCode2!";

		var ricPrefix='';
		//if('N'==vars.record.FUT_TRADING_SESSION )ricPrefix='1';
		//else if('D'==vars.record.FUT_TRADING_SESSION  && vars.symbol.indexOf(' PIT ')>=0)ricPrefix='2';
		return ricPrefix+vars.ricRoot+monthYearCode1+"-"+monthYearCode2;
	}
}

var Ric_HongKongHKG_Equity = function (){

	this.getDescription = function(){return "RIC = CODE+.HK";}

	this.calculate = function(vars,args){
		var exchangeSymbol = vars.record.CODE;
		if (exchangeSymbol==null || exchangeSymbol.length==0 || exchangeSymbol=="null") {
			throw "Exchange table field CODE not defined";
		}
		while (exchangeSymbol.length<4)
			exchangeSymbol="0"+exchangeSymbol;
		return exchangeSymbol+".HK";
	}
}

var RicRoot_LondonLME_TAPO_Futures = function RicRoot_LondonLME_TAPO_Futures(){
	this.getDescription = function(){return "Look up RIC Root in normal way but add \"OPT\" to RIC Root ";}

   this.calculate = function(vars){
	   return vars.ricRoot+"OPT";
	}
}

var MonthCode_LondonLME_DAILY_Futures = function (){
	this.getDescription = function(){return "RIC = RIC_root+'D'+day_month_year ";}

   this.calculate = function(vars){
	   var ricRoot = vars.ricRoot;
	   var secNumDes = vars.record.ID_BB_SEC_NUM_DES;
	   if (secNumDes==null) throw "ID_BB_SEC_NUM_DES is null";
	   var tokens = secNumDes.split(" ");
	   if (tokens.length!=2) throw "ID_BB_SEC_NUM_DES can not be split inti two tokens: "+secNumDes;
	   if (tokens[1].length!=8) throw "ID_BB_SEC_NUM_DES second token is not 8 chars long: "+secNumDes;
	   return JStaticTables.futuresConvertMonthToCode(tokens[1].substring(4,6));
	}
}

var YearCode_LondonLME_DAILY_Futures = function (){
	this.getDescription = function(){return "RIC = RIC_root+'D'+day_month_year ";}

   this.calculate = function(vars){
	   var ricRoot = vars.ricRoot;
	   var secNumDes = vars.record.ID_BB_SEC_NUM_DES;
	   if (secNumDes==null) throw "ID_BB_SEC_NUM_DES is null";
	   var tokens = secNumDes.split(" ");
	   if (tokens.length!=2) throw "ID_BB_SEC_NUM_DES can not be split inti two tokens: "+secNumDes;
	   if (tokens[1].length!=8) throw "ID_BB_SEC_NUM_DES second token is not 8 chars long: "+secNumDes;
	   return tokens[1].substring(3,4);
	}
}

var Ric_LondonLME_DAILY_Futures = function (){
	this.getDescription = function(){return "RIC = RIC_root+'D'+day_month_year ";}

   this.calculate = function(vars){
	   var ricRoot = vars.ricRoot;
	   var secNumDes = vars.record.ID_BB_SEC_NUM_DES;
	   if (secNumDes==null) throw "ID_BB_SEC_NUM_DES is null";
	   var tokens = secNumDes.split(" ");
	   if (tokens.length!=2) throw "ID_BB_SEC_NUM_DES can not be split inti two tokens: "+secNumDes;
	   if (tokens[1].length!=8) throw "ID_BB_SEC_NUM_DES second token is not 8 chars long: "+secNumDes;
	   var day = tokens[1].substring(6,8);
	   var month = tokens[1].substring(4,6);
	   var year = tokens[1].substring(3,4);
	   var monthCode = JStaticTables.futuresConvertMonthToCode(month);
	   var day_month_year = day+monthCode+year;
	   return ricRoot+"D"+day_month_year;
	}
}

var Filter_LondonLME_DAILY_Futures = function (){
	this.getDescription = function(){return "Filter out records where LAST_TRADEABLE_DT is more than 215 days in future ";}

   this.calculate = function(vars){
	   // expected format: 2018-06-11+00:00
	   var lastTDate = vars.record.LAST_TRADEABLE_DT;
	   lastTDate = lastTDate.substring(0,10).replace("-","");
	   var futureDay = JXHostUtils.getXHostDateStringOffsetInDays(215);
	   if (lastTDate>futureDay) return "LAST_TRADEABLE_DT is more than 215 days in the future";
	   return null;
	}
}

var RmsVenue_SwitzerlandSNF = function (){
	this.getDescription = function(){return "";}
	this.calculate = function(vars){
		var feedSource = vars.record.FEED_SOURCE;
		if ("SWEA"==feedSource)
			return "SWX";
		else if ("XW"==feedSource)
			return "SNF";
		else throw ("FEED_SOURCE value not supported: "+feedSource);
	}
}


var Filter_KoreaKSC_Equity = function(){
	this.getDescription = function(){return "";}
	this.calculate = function(vars){
		var exchSymbol = vars.record.EXCHANGE_SYMBOL;
		if (exchSymbol!=null && (exchSymbol.startsWith("A") || exchSymbol.startsWith("F") ||
				(exchSymbol.startsWith("J") && "European"==vars.record.OPT_EXER_TYP)))
			return null;
		else if (exchSymbol!=null && exchSymbol.startsWith("Q"))
			return null;
		else return "Do normal c&v.";
	}
}

var Ric_KoreaKSC_Equity = function(){
	this.getDescription = function(){return "";}
	this.calculate = function(vars){
		var exchSymbol = vars.record.EXCHANGE_SYMBOL;
		if (exchSymbol.startsWith("A") || exchSymbol.startsWith("F") ||
				(exchSymbol.startsWith("J") && "European"==vars.record.OPT_EXER_TYP))
			return exchSymbol.substring(1)+".KS";
		else if (exchSymbol.startsWith("Q"))
			return exchSymbol+".KS";
		else throw ("Do normal c&v.");
	}
}

/*var Filter_Out_TokyoTIFFE_Futures = function (){
	this.getDescription = function(){return "include if FEED_SOURCE=SGX and ID_EXCH_SYMBOL=NS";}
	this.calculate = function(vars){
		var exchangeId = vars.record.ID_FULL_EXCHANGE_SYMBOL;
		if (exchangeId==null || exchangeId=="") return "ID_FULL_EXCHANGE_SYMBOL not defined";
		if (exchangeId.endsWith("00")) return null;
		return "ID_FULL_EXCHANGE_SYMBOL does not end with '00', "+exchangeId;
	}
}*/

var RicRoot_TokyoTCE_Futures = function (){
	this.getDescription = function(){return "include if FEED_SOURCE=SGX and ID_EXCH_SYMBOL=NS";}
	this.calculate = function(vars){
		return FeedSourceToRicPrefix(vars)+vars.ricRoot;
	}
}

var PrefixSuffix = function (){
	this.getDescription = function(){return "Set: ricPrefix, ricSuffix, symbolPrefix, symbolSuffix, ricTickerSuffix";}
	this.calculate = function(vars,args){
		var ric = vars.record.RIC;
		var symbol = vars.record.SYMBOL;
		if (args.ricPrefix!=null) ric = args.ricPrefix+ric;
		if (args.ricSuffix!=null) ric = ric+args.ricSuffix;
		if (args.symbolPrefix!=null) symbol = args.symbolPrefix+symbol;
		if (args.symbolSuffix!=null) symbol = symbol+args.symbolSuffix;
		if (args.ricTickerSuffix!=null) {
			var idx = ric.lastIndexOf(".");
			if (idx>=0)
				ric=ric.substring(0,idx)+args.ricTickerSuffix+ric.substring(idx,ric.length());
			else
				ric=ric+args.ricTickerSuffix;
		}
		var record = new JRecord(vars.record);
		record.RIC_X = ric;
		record.SYMBOL_X = symbol;
		return new JRecordList(record);
	}
}

var CreateXRicMaps_RussiaMCX = function (){
	this.getDescription = function(){return "";}
	this.calculate = function(vars){
		var symbolTokens = vars.record.SYMBOL.split(" ");
		var newRecord1 = new JRecord(vars.record);
		newRecord1.RIC_X = newRecord1.RIC_X+"L";
		newRecord1.SYMBOL_X = symbolTokens[0]+" RX "+symbolTokens[2];
		var newRecord2 = new JRecord(vars.record);
		newRecord2.RIC_X = newRecord2.RIC_X+"P";
		newRecord2.SYMBOL_X = symbolTokens[0]+" RN "+symbolTokens[2];
		return new JRecordList(vars.record,newRecord1,newRecord2);
	}
}

var CreateXRicMaps_AthensATH = function () {
	this.getDescription = function(){return "";}
	this.calculate = function(vars){

		var ric = vars.record.RIC;
		var index = ric.indexOf(".");
		var ricRoot = ric.substring(0,index);
		var ricSufix = ric.substring(index);

		var newRecord = new JRecord(vars.record);
		if(ric.endsWith("r.AT"))
			newRecord.RIC_X=ricRoot.substring(0, ricRoot.length()-1)+"a"+ricSufix;
		else
			newRecord.RIC_X = ricRoot+"a"+ricSufix;
		return new JRecordList(new JRecord(vars.record),newRecord);
	}
}

var Filter_Spreads_EqualLegs = function () {
	this.getDescription = function(){return "filters out spreads with equal legs like BZZH24-H24";}
	this.calculate = function(vars){

		var currentContarctMonthYearCode = vars.record.CURRENT_CONTRACT_MONTH_YR;
		if (currentContarctMonthYearCode==null || currentContarctMonthYearCode=="")
			return "CURRENT_CONTRACT_MONTH_YR is empty";
		var tokens = currentContarctMonthYearCode.split("-");
		if(tokens.length != 2)
			throw "CURRENT_CONTRACT_MONTH_YR can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(tokens[0].length-3);
		var monthYearCode2 = tokens[1].substring(tokens[0].length-3);
		if (monthYearCode1==monthYearCode2)
			return "Both contract legs have the same monthYearCode";
		return null;
	}
}

var Ric_MontrealMON_Futures = function (){
	this.getDescription = function(){return "FUT_TRADING_SESSION->RIC_prefix: N->'1',D->'2',B->''";}
	this.calculate = function(vars){

		var prefix = '';
		var futureTradingSession = vars.futureTradingSession;
		if (futureTradingSession!=null) {
			if (futureTradingSession=='N') prefix='1';
			else if (futureTradingSession=='D' && vars.symbol.indexOf(" PIT ")>0) prefix='2';
		}

		var securityType = vars.record.SECURITY_TYP;
		if (securityType==null || securityType.length==0) throw "SECURITY_TYP not defined";
		if(securityType=="SINGLE STOCK FUTURE")vars.ric=vars.ric+":MO";

		return prefix+vars.ric;
	}
}

var Ric_MontrealMON_Options =  function (){
	this.getDescription = function(){return "Ric for MontrealMON_Options";}
	this.calculate = function(vars){
		if ("Index Option"==vars.record.SECURITY_TYP || "Equity Option"==vars.record.SECURITY_TYP) {
			var monthCode = JStaticTables.optionsConvertPCMonthToMonthCode(vars.putCall+vars.expirationDate.substring(4,6));
			var bdStrike = new JXBigDecimal(vars.record.STRIKEPRICE_X).stripTrailingZeros();
			if (bdStrike.getValue()>=1000){
				monthCode = monthCode.toLowerCase();
				bdStrike = bdStrike.multiply(10).setDP(0).removeDP();
			}else bdStrike = bdStrike.multiply(100).setDP(0).removeDP();
			var year = vars.expirationDate.substring(2,4);
			var day = vars.expirationDate.substring(6,8);
			var formattedStrikePrice =bdStrike.toString("00000");
			return vars.ricRoot+monthCode+day+year+formattedStrikePrice+".M";
		}else if ("Financial commodity option."==vars.record.SECURITY_TYP || "Physical commodity option."==vars.record.SECURITY_TYP) {
			return vars.ric;
		}
		return vars.ric;
	}
}

var Ric_Convention_LSEEuqity=  function (){
	this.getDescription = function(){return "Ric for LSE";}
	this.calculate = function(vars){
		return vars.record.ID_EXCH_SYMBOL+".L";
	}
}

var Ric_ShanghaiSHH_Equity=  function (){
	this.getDescription = function(){return "BBG Root + ShanghaiSHH venue";}
	this.calculate = function(vars){
		var feedSource = vars.record.FEED_SOURCE;
		var pkds = vars.record.PARSEKYABLE_DES_SOURCE;
		if (pkds==null || pkds.length==0) throw "Empty PARSEKYABLE_DES_SOURCE";
		var ricRoot = pkds.split(' ')[0];		// get first token
		if (feedSource == "CG")
			return ricRoot+".SS";
		else if (feedSource == "C1")
			return ricRoot+".SH";
		else throw "Unsupported FEED_SOURCE: "+feedSource;
	}
}

var Ric_ShenzhenSHZ_Equity=  function (){
	this.getDescription = function(){return "BBG Root + ShanghaiSHH venue";}
	this.calculate = function(vars){
		var feedSource = vars.record.FEED_SOURCE;
		var pkds = vars.record.PARSEKYABLE_DES_SOURCE;
		if (pkds==null || pkds.length==0) throw "Empty PARSEKYABLE_DES_SOURCE";
		var ricRoot = pkds.split(' ')[0];		// get first token
		if (feedSource == "CS")
			return ricRoot+".SZ";
		else if (feedSource == "C2")
			return ricRoot+".ZK";
		else throw "Unsupported FEED_SOURCE: "+feedSource;
	}
}

var ChainRic_AListChain = function (){
	this.getDescription = function(){return "ChainRic for A Listed records";}
	this.calculate = function(vars,args){
		var name = vars.record.NAME;
		if (name.endsWith("-A") || name.endsWith("- A")) {
			vars.record.CHAINRIC_X = args.chainRic;
			vars.record.CHAIN_SORT_VALUE_X = vars.record.RIC;
			vars.record.RIC_X = vars.record.RIC;
			return vars.record;
		}
		return null;
	}
}

var Filter_Out_FieldValue = function (){
	this.getDescription = function(){return "Filter out record where field value meets condition";}
	this.calculate = function(vars,args){
		// arguments example:  field:RIC|startsWith:1
		//jprint("RIC="+vars.record.RIC+", RIC_X="+vars.record.RIC_X+", Record="+vars.record);
		var field = args.field;
		if (field==null || field.length==0) throw "field name not defined, field="+args.field;
		var value = vars.record[field];
		if (args.startsWith!=null) {
			if (value == null) return null; // do not filter out if the value does not exists (is this correct behaviour?)
			if (value.startsWith(args.startsWith)) return "Field "+field+" value "+value+" starts with "+args.startsWith; // filter out message
			return null; // all is OK, return no filter out message
		} else throw "filter condition not specified or not supported";
	}
}

var ChainRic_FieldValueChain = function (){
	this.getDescription = function(){return "ChainRic for records where a field with name='args.field' contains value='args.value'";}
	this.calculate = function(vars,args){
		var value = vars.record[args.field];
		if (value==null) throw "Record does not contian field name: "+value;
		if (value == args.value) {
			vars.record.CHAINRIC_X = args.chainRic;
			vars.record.CHAIN_SORT_VALUE_X = vars.record.RIC;
			vars.record.RIC_X = vars.record.RIC;
			return vars.record;
		}
		return null;
	}
}

var Ric_IceLiffe =  function (){
	this.getDescription = function(){return "Ric for IceIEU_F_Futures";}
	this.calculate = function(vars){
		if ("SINGLE STOCK DIVIDEND FUTURE"==vars.record.SECURITY_TYP) {
			var monthCode = JStaticTables.futuresConvertMonthToCode(vars.record.LAST_TRADEABLE_DT.substring(5,7));
			var day=vars.record.LAST_TRADEABLE_DT.substring(8,10);
			var year=vars.record.LAST_TRADEABLE_DT.substring(2,4);
			return vars.ricRoot+monthCode+day+year;
		}
		return vars.ric;
	}
}

var Ric_KoreaKFE_Futures = function (){
	this.getDescription = function(){return "FEED_SOURCE->RIC_prefix: KS->':KS',FEED_SOURCE->RIC_prefix: eKFE->'C'";}
	this.calculate = function(vars){

		var prefix = '';
		var suffix = '';
		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource=="KS") suffix=":KE";
		else if (feedSource=="eKFE") prefix="C";
		else{
			var securityTyp=vars.record.SECURITY_TYP;
			if(feedSource=="cKFE" /*&& securityTyp == 'Financial index generic.'*/) prefix="CM";
		}
		return prefix+vars.ric+suffix;
	}
}

var ChainRic_KoreaKFE_Futures = function (){
	this.getDescription = function(){return "FEED_SOURCE->RIC_prefix: KS->':KE',FEED_SOURCE->RIC_prefix: eKFE->'C'";}
	this.calculate = function(vars){

		var prefix = '';
		var suffix = '';
		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource=="KS") suffix="KE";
		else if (feedSource=="eKFE") prefix="C";
		else{
			var securityTyp=vars.record.SECURITY_TYP;
			if(feedSource=="cKFE" /*&& securityTyp == 'Financial index generic.'*/) prefix="CM";
		}
		return prefix+vars.chainRic+suffix;
	}
}

var ChainRic_KoreaKFE_Spreads = function (){
	this.getDescription = function(){return "";}
	this.calculate = function(vars){
		return vars.chainRic+"KE";
	}
}

var ExchangeRicSuffix_KoreaKFE_Options = function(){
	this.getDescription = function(){return "Korea ID_MIC_PRIM_EXCH to exchange ric suffix lookup";}
	this.calculate = function(vars){
		var futuresCategory = vars.record.FUTURES_CATEGORY;
		if("Equity Index Spot Options" == futuresCategory)return  ".KS";
		else if("Equity Option" == futuresCategory)return  ".KE";
		else if("Spot Currency Options" == futuresCategory)return  "";
		else if("Weekly Index Options" == futuresCategory)return  ".KE";
/*		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource!=null && "KOPT"==feedSource) return ".KE";*/
		return "";
	}
}

var Filter_TokyoTYO_TSE_Indices = function(){
	this.getDescription = function(){return "Filters out if ID_EXCH_SYMBOL >2517 ";}
	this.calculate = function(vars){
		var id = parseInt(vars.record.ID_EXCH_SYMBOL);
		if (isNaN(id)) return "ID_EXCH_SYMBOL format is not integer: "+vars.record.ID_EXCH_SYMBOL;
		if (id>2517) return null;
		return "Old format for ID_EXCH_SYMBOL<=2517";
	}
}

var ProcessRecord_TokyoTYO_TSE_Indices = function (){
	this.getDescription = function(){return "RIC=ID_EXCH_SYMBOL+JPiv.P SYMBOL=ID_EXCH_SYMBOL+IV Index";}
	this.calculate = function(vars,args){
		vars.record.RIC_X = vars.record.ID_EXCH_SYMBOL+"JPiv.P";
		vars.record.SYMBOL_X = vars.record.ID_EXCH_SYMBOL+"IV Index";
		return new JRecordList(vars.record);
	}
}

var ProcessRecord_TokyoTYO_TSE_Indices_Ext = function (){
	this.getDescription = function(){return "RIC=ID_EXCH_SYMBOL+iv.P SYMBOL=ID_EXCH_SYMBOL+IV Index";}
	this.calculate = function(vars,args){
		vars.record.RIC_X = vars.record.ID_EXCH_SYMBOL+"iv.P";
		vars.record.SYMBOL_X = vars.record.ID_EXCH_SYMBOL+"IV Index";
		return new JRecordList(vars.record);
	}
}

var ChainRic_ChicagoONE_Futures = function (){
	this.getDescription = function(){return "Add ':OX' to chain ric.";}

	this.calculate = function(vars){
		return vars.chainRic+'OX';
	}
}

var ChainRic_LondonLME_Futures = function (){
	this.getDescription = function(){return "Add suffux";}

	this.calculate = function(vars,args){
		return vars.ricRoot+args.suffix+":";
	}
}

var Ric_IceIEU_Futures = function Ric_IceIEU_Futures(){
	this.getDescription = function(){return "";}

   this.calculate = function(vars){
	   var exchangeSymbol = vars.record.ID_FULL_EXCHANGE_SYMBOL;
	   if(exchangeSymbol.endsWith("!"))return vars.ric;
		var securityTyp=vars.record.SECURITY_TYP;
		if(securityTyp == 'Financial commodity generic.'){
			return vars.ric;
		}

	   var tokens_1 = exchangeSymbol.split(' ');
	   if(tokens_1.length<2)throw "Can't parse ID_FULL_EXCHANGE_SYMBOL!";
	   var tokens_2  = tokens_1[1].split('.');
	   if(tokens_2.length<2)throw "Can't parse second token of ID_EXCHANGE_SYMBOL!";

	   var month = tokens_2[1].substring(0,1);
	   var year = tokens_2[1].substring(tokens_2[1].length-1);

	   return vars.ricRoot+month+year;
	}
}

var FormatStrikePrice_DpForceRule = function (){
	this.getDescription = function(){return "FormatStrikePrice_DpCorrectionToDefault";}
	this.calculate = function(vars){
		var bdStrike = new JXBigDecimal(vars.formattedStrikePrice);
		var formattedStrikePrice = JRulesOptionsExt.formatStrikePriceForRic(vars.formattedStrikePrice,true,vars);
		if (bdStrike.compareTo("1")<0 && formattedStrikePrice.startsWith("0"))
			formattedStrikePrice = formattedStrikePrice.substring(1,formattedStrikePrice.length);
		return formattedStrikePrice;
	}
}
var FormatStrikePrice__WarsawWSE_Options = function (){
	this.getDescription = function(){return "FormatStrikePrice_WarsawWSE_Options";}
	this.calculate = function(vars){
		if(vars.rules!=null)
			return (new FormatStrikePrice_DpForceRule()).calculate(vars);
		var formattedStrikePrice = (new JXBigDecimal(vars.formattedStrikePrice)).removeDP().toString();
		formattedStrikePrice = formattedStrikePrice.substring(0,3);
		return formattedStrikePrice;
	}
}

var ChainRic_EuroTLX_Bonds = function (){
	this.getDescription = function(){return "Create #ETLXALL=TX chain!";}

	this.calculate = function(vars){
		return "ETLXALL=TX";
	}
}

var Symbol_GBTSY_Bonds = function (){
	this.getDescription = function(){return "";}
	this.calculate = function(vars){
		return vars.symbol.replace("@TWMD","@CBBT");
	}
}

var ProcessRecord_IndiaINC_Equity = function (){
	this.getDescription = function(){return "No Chain Creation!";}

	this.calculate = function(vars){
		var record = vars.record;
		var ric = record.RIC;
		var symbol = record.SYMBOL;

		var index = ric.indexOf(".");
		if (index<0) throw "Unexpected RIC format, there is no .suffix in: "+ric;

		record.SYMBOL_X = symbol.replace(" IB"," IN");
		record.RIC_X = ric.substring(0, index) + ".INx";
		record.SOURCE_X = "INC_GRP";
		return JArrays.asList(record);
	}
}

var Ric_Convention_EuropeBTE_CHI_Equity = function (){

	this.getDescription = function(){return "RIC = EXCHANGE_SYMBOL+Suffix(FEED_SOURCE)";}

	this.calculate = function(vars,args){
		var symbol = vars.record.EXCHANGE_SYMBOL;
		if (symbol==null || symbol.length==0)
			throw "EXCHANGE_SYMBOL not defined";
		var ric = symbol;
		var ricExtension ="";

		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource==null || feedSource.length==0)
			throw "FEED_SOURCE not defined";

		ricExtension = JStaticTables.exchangesGetAnyFieldValueFromAnyFeildValue("BBG_EXCHANGE",feedSource,"RIC_EXTENSION");
		return ric+ricExtension;
	}
}

var Ric_Convention_JapanXCA_Equity = function (){

	this.getDescription = function(){return "RIC = ID_EXCH_SYMBOL + CRNCY + '.JPx'";}

	this.calculate = function(vars,args){
		var symbol = vars.record.ID_EXCH_SYMBOL;
		if (symbol==null || symbol.length==0)
			throw "ID_EXCH_SYMBOL not defined";
		var currency = vars.record.CRNCY;
		if (currency==null || currency.length==0)
			throw "CRNCY not defined";
		return symbol+currency+'.JPx';
	}
}

var RMSCurrency_BGN_ISIN_Bonds  = function (){
	this.getDescription = function() {return "Set RMS ric code for C&V";}
	this.calculate = function(vars) {
		var rmsCurrency = vars.rmsCurrency;
		if (rmsCurrency=="CLP") return "CLF";
		if (rmsCurrency=="COP") return "COU";
		if (rmsCurrency=="UYU") return "UYI";
		if (rmsCurrency=="MXN") return "MXV";
		return rmsCurrency;
	}
}

var RMSCode_BGN_ISIN_Bonds = function (){
	this.getDescription = function() {return "Set RMS ric code for C&V";}
	this.calculate = function(vars) {
		var rmsCode = vars.record.ID_ISIN;
		if (rmsCode==null || rmsCode.length==0)
			rmsCode=vars.record.ID_CUSIP;
		return rmsCode;
	}
}

var Ric_BGN_ISIN_Bonds = function (){
	this.getDescription = function(){return "Format ric";}
	this.calculate = function(vars){
		var isin = vars.record.ID_ISIN;
		var cusip = vars.record.ID_CUSIP; // the filter makes sure that ID_CUSIP is not null
		if (isin==null || isin.length==0)
			return cusip+"=";
		if (isin.startsWith("US"))
			return cusip+"=";
		// if isin starts with one of those strings then use 12 char ISIN
		if (["FR","AT","DK","DO","HR","IL","RO","RS","SE","SI","SK","TR","UA"].indexOf(isin.substring(0,2)<0))
			isin = isin.substring(0,11);	// for all others trye with 11 char ISIN

		var bbgCountryCode = vars.record.COUNTRY;
		if ("MULT"==bbgCountryCode) return null; // leave it for C&V

		if (vars.record.ID_ISIN.startsWith("XS")) {
			// replace XS woith ISO country code
			if (bbgCountryCode==null || bbgCountryCode.length==0)
				throw "BBG COUNTRY is not defined for XS ISIN";
			var countryCode = bbgCountryCode=="SNAT" ? "XS" : JStaticTables.countryCodeBBG2CtoISO2C(bbgCountryCode);
			if (countryCode==null)
				throw "ISO COUNTRY is not defined for BBG COUNTRY code: "+bbgCountryCode;
			return countryCode+isin.substring(2)+"=";
		}
		return isin+"=";
	}
}

var CXRM_BGN_ISIN_Bonds = function (){
	this.getDescription = function(){return "create xmap records";}
	this.calculate = function(vars){
		var records = new JArrayList();
		var isin = vars.record.ID_ISIN;
		if (isin==null || isin.length==0) return records;
		records.add(new JRecord(vars.record,"BBGSYMBOL",isin+" Corp"));
		records.add(new JRecord(vars.record,"BBGSYMBOL",isin+" Govt"));
		return records;
	}
}

var Ric_Convention_AustraliaAUX_Equity = function (){

	this.getDescription = function(){return "RIC = ID_EXCH_SYMBOL + '.AUX'";}

	this.calculate = function(vars,args){
		var symbol = vars.record.ID_EXCH_SYMBOL;
		if (symbol==null || symbol.length==0)
			throw "ID_EXCH_SYMBOL not defined";
		return symbol+'.AUX';
	}
}

var Ric_Convention_AustraliaCHA_Equity = function (){

	this.getDescription = function(){return "RIC = ID_EXCH_SYMBOL + '.CHA'";}

	this.calculate = function(vars,args){
		var symbol = vars.record.ID_EXCH_SYMBOL;
		if (symbol==null || symbol.length==0)
			throw "ID_EXCH_SYMBOL not defined";
		return symbol+'.CHA';
	}
}

var PostProcessor_CXRMequity = function (){

	this.getDescription = function(){return "";}

	var feedSourceRegToCompLookup = JXHostContext.getLookupTable("bbg__lookups").getLookupEx("FeedSourceRegToComp");

	this.calculate = function(vars,args){
		var records= new JArrayList();

		var bbgSymbol = vars.record.BBGSYMBOL;
		if (bbgSymbol==null || bbgSymbol.length==0)
			 throw "Empty BBGSYMBOL";

		var feedSource = vars.record.FEED_SOURCE;
		if (feedSource==null || feedSource.length==0)
			 throw "Empty FEED_SOURCE";

		var regionalFeedSourceStr = " "+feedSource+" Equity";
		var compositeFeedSourceStr = null;
		var lookupRecord =  feedSourceRegToCompLookup.getRecordEx(feedSource);
		if (lookupRecord!=null) {
			if (lookupRecord.STATUS!='ACTIVE')
				return null;
			compositeFeedSourceStr = " "+lookupRecord.VALUE+" Equity";
		}

		if (!bbgSymbol.contains(" "+feedSource+" "))
			throw "FEED_SOURCE value is not in the BBGSYMBOL";
		if (!bbgSymbol.contains(regionalFeedSourceStr))
			throw "BBGSYMBOL does not end with ' <FEED_SOURCE> Equity'";

		records.add(new JRecord(vars.record,"BBGSYMBOL",bbgSymbol.replace(regionalFeedSourceStr, compositeFeedSourceStr)));

		return records;
	}

}


var PostProcessor_Equity_Add_ELEC = function (){

	this.getDescription = function(){return "";}

	this.calculate = function(vars,args){

		var record=new JRecord(vars.record);

		var bbgSymbol = record.BBGSYMBOL;
		var symbol = record.SYMBOL;
		var ric = record.RIC;
		var feedSource = record.FEED_SOURCE;
		if (bbgSymbol==null || bbgSymbol.length==0) throw "Empty BBGSYMBOL";
		if (symbol==null || symbol.length==0) throw "Empty SYMBOL";
		if (ric==null || ric.length==0) throw "Empty RIC";
		if (feedSource==null || feedSource.length==0) throw "Empty FEED_SOURCE";
		if (feedSource!=args.feedSource) throw "FEED_SOURCE is not: "+args.feedSource;

		record.RIC="1"+ric;
		record.SYMBOL=symbol.replace(" "+feedSource+" "," "+args.feedSourceElec+" ");
		record.BBGSYMBOL=bbgSymbol.replace(" "+feedSource+" "," "+args.feedSourceElec+" ");

		var records = new JArrayList();
		records.add(record);
		return records;
	}

}

var ProcessRecord_HongKongHKG_TSE_Indices = function (){
	this.getDescription = function(){return "RIC=ID_EXCH_SYMBOL+iv.P SYMBOL=ID_EXCH_SYMBOL+IV Index";}
	this.calculate = function(vars,args){
		vars.record.RIC_X = vars.record.ID_EXCH_SYMBOL+"iv.P";
		vars.record.SYMBOL_X = vars.record.ID_EXCH_SYMBOL+"IV Index";
		return new JRecordList(vars.record);
	}
}

var ProcessRecord_HongKongHKG_TSE_Indices_Ext = function (){
	this.getDescription = function(){return "RIC=ID_EXCH_SYMBOL+JPiv.P SYMBOL=ID_EXCH_SYMBOL+IV Index";}
	this.calculate = function(vars,args){
		vars.record.RIC_X = vars.record.ID_EXCH_SYMBOL+"JPiv.P";
		vars.record.SYMBOL_X = vars.record.ID_EXCH_SYMBOL+"IV Index";
		return new JRecordList(vars.record);
	}
}

var FlterOutBlankExchangeSymbolUnlessActive = function (){
	this.getDescription = function(){return "Filter out empty ID_EXCH_SYMBOL unless MARKET_STATUS = ACTV";}
	this.calculate = function(vars,args){
		var exchangeSymbol = vars.record.ID_EXCH_SYMBOL;
		var marketStatus = vars.record.MARKET_STATUS;
		if (exchangeSymbol!=null && exchangeSymbol.length>0) return null;
		if (marketStatus!=null && marketStatus=="ACTV") return null;
		return "Empty ID_EXCH_SYMBOL and MARKET_STATUS not ACTV";
	}
}

var Ric_ThailandTFX_Spreads = function (){
	this.getDescription = function(){return "Spread RIC rule for Thailand TFX.";}
	this.calculate = function(vars,args){
		if(vars.record.CURRENT_CONTRACT_MONTH_YR==null)throw "CURRENT_CONTRACT_MONTH_YR  is null!";
		var tokens = vars.record.CURRENT_CONTRACT_MONTH_YR.split("-");
		if(tokens.length != 2) throw "CURRENT_CONTRACT_MONTH_YR  can not split in 2 values!";
		var monthYearCode1 = tokens[0].substring(0,1)+tokens[0].substring(tokens[0].length-1);
		var monthYearCode2 = tokens[1].substring(0,1)+tokens[1].substring(tokens[1].length-1);
		if(monthYearCode1==monthYearCode2)throw "CURRENT_CONTRACT_MONTH_YR: monthYearCode1 == monthYearCode2!";

		var ric = vars.ricRoot+monthYearCode1+"-"+monthYearCode2;
		return ric;
	}
}

var L2_SwitzerlandSWX_Equity = function(){
	this.getDescription = function(){return "add a PREFIX and SUFFIX";}

	this.calculate = function(vars,args){
		var ric = vars.ric;
		var record = vars.record;
		record.SYMBOL = vars.symbol+'?level=2';
		if(vars.record.VENUE =='SWX' || vars.record.VENUE =='VTX')
			record.RIC= args.prefix+ric;
		else if(vars.record.VENUE =='BRN')
			record.RIC= ric + args.suffix;
		else throw "VENUE is NOT SWX, VTS or BRN!";
		return JArrays.asList(record);
	}
}