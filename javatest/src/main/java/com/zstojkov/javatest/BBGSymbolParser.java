package com.zstojkov.javatest;



import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;


public class BBGSymbolParser {

	public static BBGSymbolParser getParser(String symbol) {
		return new BBGSymbolParser(symbol);
	}

	public enum SymbolType {
		OptionEquity("Equity"),
		OptionIndex("Index"),
		OptionComodity("Comdty"),
		OptionCurrency("Curncy"),
		Unknown("UnknownType");
		private String symbolSuffix;
		private SymbolType(String symbolSuffix) { this.symbolSuffix=symbolSuffix; }
		public String getSymbolSuffix() { return symbolSuffix; }
	};

	public enum Session {COMB,ELEC,PIT}

	private String symbol = null;
	private String [] tokens = null;
	private int dateTokenIndex = -1;
	private int priceTokenIndex = -1;
	private String putCall = null;
	private String dateAsString = null;
	private BigDecimal strike = null;
	private Session session = null;
	private SymbolType type = SymbolType.Unknown;
	private String solrQuery = null;
	private String symbolMatchRegex = null;
	private StringBuffer debugMessage = null;

	public BBGSymbolParser(String symbol) {
		this.symbol = symbol.replace("/\\s\\s+/g", " ").trim();
		parse();
	}

	private void parse() {
		boolean debug = true;

		if (debug) debugMessage = new StringBuffer();
		//
		tokens = symbol.split(" ");
		solrQuery = symbol;
		symbolMatchRegex = symbol.replaceAll("\\.", "\\.").replaceAll("\\*", "\\*").replaceAll("\\\\", "\\\\")
				.replaceAll("\\+", "\\+").replaceAll("\\?", "\\?").replaceAll("\\^", "\\^").replaceAll("\\$", "\\$");// there could be more

		// remove session
		String symbolWithoutSession = symbol;
		for (Session sess : Session.values()) {
			String sessionString = " "+sess.name()+" ";
			if (symbolWithoutSession.contains(sessionString)) {
				symbolWithoutSession = symbolWithoutSession.replace(sessionString, " ");
				session = sess;
				break;
			}
		}
		// split to tokens
		String[] currentTokens = symbolWithoutSession.split(" ");
		if (currentTokens.length<3) {
			if (debug) debugMessage.append(" tokens.length<3,");
			return;
		}

		// Find potential symbol type
		SymbolType potentialSymbolType = SymbolType.Unknown;
		for (SymbolType symbolType : SymbolType.values()) {
			if (symbol.endsWith(symbolType.symbolSuffix)) {
				potentialSymbolType = symbolType;
				break;
			}
		}
		if (potentialSymbolType==SymbolType.Unknown) {
			if (debug) debugMessage.append(" suffix does not match any SymbolType,");
			return;
		}

		if (currentTokens.length==3) {
			if (debug) debugMessage.append(" currentTokensLength=3,");
			if (!potentialSymbolType.equals(SymbolType.OptionComodity) &&
					!potentialSymbolType.equals(SymbolType.OptionCurrency) &&
					!potentialSymbolType.equals(SymbolType.OptionIndex)) {
				if (debug) debugMessage.append(" suffix does not match expected SymbolType,");
				return;
			}
			int strikeIndex = currentTokens.length-2;
			String strikeString = currentTokens[strikeIndex];
			try { strike = new BigDecimal(strikeString) ; }
			catch (Exception e) {
				if (debug) debugMessage.append(" "+strikeString+" is not BigDecimal,");
				return;
			}
			priceTokenIndex = strikeIndex;
			if (debug) debugMessage.append(" strike found,");

			symbolMatchRegex = createSymbolMatchingRegexForFops(strikeString);
			solrQuery = createSolrQueryForFops(strikeString);
			type = potentialSymbolType;
			return;

		} else { //if (currentTokens.length>3) {
			if (debug) debugMessage.append(" currentTokensLength>3,");
			if (!potentialSymbolType.equals(SymbolType.OptionEquity) &&
					!potentialSymbolType.equals(SymbolType.OptionIndex)) {
				if (debug) debugMessage.append(" suffix does not match expected SymbolType,");
				return;
			}
			int strikeIndex = currentTokens.length-2;
			String strikeString = currentTokens[strikeIndex];
			String pc = strikeString.substring(0,1);
			if (!pc.equals("C") && !pc.equals("P")) {
				if (debug) debugMessage.append(" no P or C in front of strike price "+strikeString+",");
				return;
			}
			strikeString = strikeString.substring(1);
			try { strike = new BigDecimal(strikeString) ; }
			catch (Exception e) {
				if (debug) debugMessage.append(" "+strikeString.substring(1)+" is not BigDecimal,");
				return;
			}
			putCall = pc;
			priceTokenIndex = strikeIndex;
			if (debug) debugMessage.append(" strike found,");

			int dateIndex = priceTokenIndex-1;
			String dateString = currentTokens[dateIndex];
			String[] dateTokens = dateString.split("/");
			Date date=null;
			if (dateTokens.length==1) {
				if ((date=parseDate("MM",dateString,debug))==null) return;
			} else if (dateTokens.length==2) {
				if ((date=parseDate("MM/yy",dateString,debug))==null) return;
			} else if (dateTokens.length==3) {
				if ((date=parseDate("MM/dd/yy",dateString,debug))==null) return;
				dateAsString = new SimpleDateFormat("yyyyMMdd").format(date);
			} else {
				if (debug) debugMessage.append(" dateTokens.length>3,");
				return;
			}
			dateTokenIndex = dateIndex;
			if (debug) debugMessage.append(" date found,");

			symbolMatchRegex = createSymbolMatchingRegexForOptions(dateTokens,strikeString,putCall);
			solrQuery = createSolrQueryForOptions(dateTokens,strikeString,putCall);
			type = potentialSymbolType;
			return;
		}
	}

	private Date parseDate(String dateFormat, String dateString, boolean debug) {
		try {
			return new SimpleDateFormat(dateFormat).parse(dateString);
		} catch (Exception e) {
			if (debug) debugMessage.append(" format of date "+dateString+" is not "+dateFormat+",");
			return null;
		}
	}

	private String createSymbolMatchingRegexForOptions(String[] dateTokens, String strikeString, String putCall) {
		String regex = "^";
		for (int i=0 ;i<tokens.length;i++) {
			if (i>0) regex+=" ";
			if (i==dateTokenIndex) {
				if      (dateTokens.length==1) regex+=(dateTokens[0].length()==1?"[0]?":"")+dateTokens[0]+"((/\\d{1,2})?){1,2}";
				else if (dateTokens.length==2) regex+=(dateTokens[0].length()==1?"[0]?":"")+dateTokens[0]+"((/\\d{1,2})?)/"+dateTokens[1];
				else if (dateTokens.length==3) regex+=(dateTokens[0].length()==1?"[0]?":"")+dateTokens[0]+"/"+(dateTokens[1].length()==1?"[0]?":"")+dateTokens[1]+"/"+dateTokens[2];
			} else if (i==priceTokenIndex) {
				while (strikeString.startsWith("0") && strikeString.length()>1) strikeString=strikeString.substring(1);
				if (strikeString.matches("^\\d*\\.(0*)?$")) strikeString=strikeString.substring(0,strikeString.indexOf("."));
				regex+=(putCall+"(0*)"+strikeString.replace(".", "\\.")+"(\\.?0*)");
			} else {
				regex+=tokens[i];
			}
		}
		regex+="$";
		return regex;
	}

	private String createSymbolMatchingRegexForFops( String strikeString) {
		String regex = "^";
		for (int i=0 ;i<tokens.length;i++) {
			if (i>0) regex+=" ";
			if (i==priceTokenIndex) {
				while (strikeString.startsWith("0") && strikeString.length()>1) strikeString=strikeString.substring(1);
				if (strikeString.matches("^\\d*\\.(0*)?$")) strikeString=strikeString.substring(0,strikeString.indexOf("."));
				regex+=("(0*)"+strikeString.replace(".", "\\.")+"(\\.?0*)");
			} else {
				regex+=tokens[i];
			}
		}
		regex+="$";
		return regex;
	}

	private String createSolrQueryForOptions( String[] dateTokens, String strikeString, String putCall) {
		String query = "";
		for (int i=0 ;i<tokens.length;i++) {
			if (i>0) query+=" ";
			if (i==dateTokenIndex) {
				if      (dateTokens.length==1) query+=("*"+dateTokens[0]+"*");
				else if (dateTokens.length==2) query+=("*"+dateTokens[0]+"/*"+dateTokens[1]);
				else if (dateTokens.length==3) query+=("*"+dateTokens[0]+"/*"+dateTokens[1]+"/"+dateTokens[2]);
			} else if (i==priceTokenIndex) {
				while (strikeString.startsWith("0") && strikeString.length()>1) strikeString=strikeString.substring(1);
				if (strikeString.matches("^\\d*\\.(0*)?$")) strikeString=strikeString.substring(0,strikeString.indexOf("."));
				query+=(putCall+"*"+strikeString+"*");
			} else {
				query+=tokens[i];
			}
		}
		query+="*";
		return query;

	}

	private String createSolrQueryForFops( String strikeString) {
		String query = "";
		for (int i=0 ;i<tokens.length;i++) {
			if (i>0) query+=" ";
			if (i==priceTokenIndex) {
				while (strikeString.startsWith("0") && strikeString.length()>1) strikeString=strikeString.substring(1);
				if (strikeString.matches("^\\d*\\.(0*)?$")) strikeString=strikeString.substring(0,strikeString.indexOf("."));
				query+=("*"+strikeString+"*");
			} else {
				query+=tokens[i];
			}
		}
		query+="*";
		return query;
	}

	public boolean isMatchingDate(String dateString) {
		if (dateString==null || dateAsString==null) return false;
		return dateString.equals(dateAsString);
	}

	public boolean isMatchingPrice(String price) {
		String pc = price.substring(0,1);
		String strikeString = price;
		if (pc.equals("C") || pc.equals("P")) {
			if (!pc.equals(putCall)) return false;
			strikeString = strikeString.substring(1);
		}
		try {
			BigDecimal strikePrice = new BigDecimal(strikeString) ;
			return strikePrice.equals(strike);
		} catch (Exception e) {
			return false;
		}
	}

	public String getSymbol() { return symbol; }
	public Session getSession() { return session; }
	public String getSymbolMatchRegex() { return symbolMatchRegex; }
	public String getSolrQuery() { return solrQuery; }
	public String[] getTokens() { return tokens; }
	public int getDateTokenIndex() { return dateTokenIndex; }	// <0 if date does not exist
	public String getDateAsString() { return dateAsString; }
	public int getPriceTokenIndex() { return priceTokenIndex; }	// <0 if price does not exist
	public String getTokenAt(int index) {
		if (index<0 || index>=tokens.length) return null;
		return tokens[index];
	}
	public BigDecimal getStrike() { return strike; }
	public String getPutCall() { return putCall; }
	public SymbolType getSymbolType() { return type; }
	@Override
	public String toString() {
		StringBuffer debugString = new StringBuffer();
		debugString.append("("+symbol);
		debugString.append(","+type.name());
		debugString.append(","+Arrays.asList(tokens));
		debugString.append(","+session);
		debugString.append(","+dateTokenIndex);
		debugString.append(","+priceTokenIndex);
		debugString.append(","+putCall);
		debugString.append(","+strike);
		debugString.append(","+dateAsString);
		debugString.append(","+solrQuery);
		debugString.append(",\""+symbolMatchRegex+"\"");
		debugString.append(","+debugMessage);
		debugString.append(")");
		return debugString.toString();
	}
}
