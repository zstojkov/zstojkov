package com.zstojkov.javatest;

import java.util.HashMap;
import java.util.Map;

import com.magtia.xhost.utils.Utils.Pair;

public class ENSParser {

	public static String sampleMsg = "notification = {\n"
			+"    Subject = \"Nairobi Securities Exchange - Feed Migration to Millennium\"\n"
			+"    Body = \"Nairobi Securities Exchange will upgrade its equity feed to the Millennium platform.  \n"
			+"\n"
			+"The expected changes to data include:\n"
			+"- new market segments. \n"
			+"- support of trading system identifiers. \n"
			+"- Security Status 2.0. \n"
			+"- new trade condition codes. \n"
			+"- Bloomberg Standard Condition Codes (BSCC). \n"
			+"- an increase market depth. \n"
			+"- support of standard fields. \n"
			+"\n"
			+"Please see 11959_BPIPE_v9.pdf for details.\"\n"
			+"    EffectiveFromDate = 2019-10-14+00:00\n"
			+"    EffectiveToDate = 2019-10-14+00:00\n"
			+"    PublishDate = 2016-11-17+00:00\n"
			+"    RevisionDate = 2019-08-19+00:00\n"
			+"    AssetClass[] = {\n"
			+"        EQUITIES\n"
			+"    }\n"
			+"    BulkFilesAffected[] = {\n"
			+"    }\n"
			+"    ChangeCategory[] = {\n"
			+"        DATA_CHANGE\n"
			+"    }\n"
			+"    ChangeDriver[] = {\n"
			+"        EXCHANGE\n"
			+"    }\n"
			+"    ClientAction[] = {\n"
			+"        Data Review| \n"
			+"    }\n"
			+"    ImpactedBloombergFields[] = {\n"
			+"        AUCTION_TYPE (P1558), AUCTION_TYPE_REALTIME (Q1558), BB_STANDARD_CONDITION_CODE_RT (Q1783), EVT_TRADE_BLOOMBERG_STD_CC_RT (Q2361), EVT_TRADE_IDENTIFIER_RT (RQ401), EVT_TRADE_INTEGER_IDENTIFIER_RT (Q2612), EXCH_MARKET_STATUS (PR175), EXCH_MKT_GRP (EX014), EXCH_MKT_GRP_RT (Q2901), FULL_EXCHANGE_SYMBOL_REALTIME (Q1976), ID_FULL_EXCHANGE_SYMBOL (EX018), IMBALANCE_BUY (RQ081), IMBALANCE_INDIC (PR875), IMBALANCE_INDIC_RT (RQ144), IMBALANCE_SELL (RQ082), ORDER_IMB_BUY_VOLUME (RQ083), ORDER_IMB_SELL_VOLUME (RQ084), PX_IMBALANCE_BUY (PR838), PX_IMBALANCE_SELL (PR839), PX_ORDER_IMB_BUY_VOLUME (PR840), PX_ORDER_IMB_SELL_VOLUME (PR841), PX_THEO (PR089), PX_VOLUME_THEO (PR160), RT_EXCH_MARKET_STATUS (RQ170), RT_SIMP_SEC_STATUS (RQ181), RT_TRADING_PERIOD (RQ063), SIMP_SEC_STATUS (PR746), SOURCE_TRADING_PERIOD (P1575), SOURCE_TRADING_PERIOD_REALTIME (Q1575), SOURCE_TRADING_STATUS (P1574), SOURCE_TRADING_STATUS_REALTIME (Q1574), THEO_PRICE (RQ089), TRADING_HALT_REASON_TYPE (P1559), TRADING_HALT_REASON_TYPE_RT (Q1559), TRADING_PERIOD (PR287), TRADING_SYSTEM_IDENTIFIER_DES (EX024), TRADING_SYSTEM_IDENTIFIER (EX023), TS_IDENTIFIER_REALTIME (Q1977), VOLUME_THEO (RQ160)\n"
			+"    }\n"
			+"    NewEID[] = {\n"
			+"    }\n"
			+"    NewExchange[] = {\n"
			+"    }\n"
			+"    OldEID[] = {\n"
			+"        34877|Nairobi Securities Exchange, 39691|Nairobi Securities Exchange - Delayed\n"
			+"    }\n"
			+"    OldExchange[] = {\n"
			+"    }\n"
			+"    Product[] = {\n"
			+"        REAL-TIME_FEEDS_AND_TECHNOLOGY\n"
			+"    }\n"
			+"    ProductRegion[] = {\n"
			+"        EMEA\n"
			+"    }\n"
			+"    ReferenceID[] = {\n"
			+"        11959\n"
			+"    }\n"
			+"    Region[] = {\n"
			+"        EMEA\n"
			+"    }\n"
			+"    RevisionDetail[] = {\n"
			+"        19/08/2019 - Amended effective date to 14 October 2019 from TBD  per 11959_BPIPE_v9.pdf.\n"
			+"\n"
			+"12/06/2019 - Amended effective date to TBD from 24 June 2019 per 11959_BPIPE_v8.pdf.\n"
			+"\n"
			+"28/05/2019 - Amended effective date to 24 June 2019 from TBD per 11959_BPIPE_v7.pdf.\n"
			+"\n"
			+"24/04/2019 - Amended effective date to TBD from 20 May 2019 per 11959_BPIPE_v6.pdf.\n"
			+"\n"
			+"12/04/2019 - Amended notice details including the effective date to 20 May 2019 from 29 April 2019 per 11959_BPIPE_v5.pdf.\n"
			+"\n"
			+"27/03/2019 - Amended effective date to 29 April 2019 from 15 April 2019 per 11959_BPIPE_v4.pdf.\n"
			+"\n"
			+"06/03/2019 - Amended effective date to 15 April 2019 from TBD per 11959_BPIPE_v3.pdf.\n"
			+"\n"
			+"13/07/2018 - Amended effective date to TBD from 23 July 2018 per 11959_BPIPE_v2.pdf.\n"
			+"\n"
			+"11/07/2018 - Amended notice details per 11959_BPIPE_v1.pdf.\n"
			+"\n"
			+"27/06/2018 - Amended notice details to revise the release features and the effective date to 23 July 2018 from TBD. Removed 11959_NSE_v3.pdf. It will be replaced with a new notice once details are available.\n"
			+"\n"
			+"29/09/2017 - Amended effective date to TBD from Q3 2017 per 11959_NSE_v3.pdf.\n"
			+"\n"
			+"21/06/2017 - Amended effective date to Q3 2017 from Q2 2017 per 11959_NSE_v2.pdf .\n"
			+"\n"
			+"22/03/2017 - Provided details of expected enhancements.\n"
			+"    }\n"
			+"    RevisionStatus[] = {\n"
			+"        AMENDED_EFFECTIVE_DATE\n"
			+"    }\n"
			+"    SubProduct[] = {\n"
			+"        B-PIPE\n"
			+"    }\n"
			+"}\n";

	private static class Parser{
		private String message;
		private int currentIndex;
		public Parser(String message) throws Exception {
			this.message=message;
			currentIndex = 0;
			currentIndex = message.indexOf("{");
			if (currentIndex<0) throw new Exception("ENS Message without content");
			currentIndex++;
		}
		Pair<String,String> getNextField() throws Exception {
			currentIndex = skipWhitespaces(message,currentIndex);
			int indexAssignement = message.indexOf("=",currentIndex);
			if (indexAssignement<0) return null;
			String fieldName = message.substring(currentIndex,indexAssignement-1);
			fieldName = trimWhitespaces(fieldName);
			currentIndex=indexAssignement+1;
			if (fieldName.length()==0) throw new Exception("ENS field name empty");
			if (fieldName.endsWith("[]")) fieldName=fieldName.substring(0,fieldName.length()-2);
			currentIndex = skipWhitespaces(message,currentIndex);
			char fieldValueFirstChar = message.charAt(currentIndex);
			int indexValue;
			if (fieldValueFirstChar=='{') {
				currentIndex++;
				indexValue = message.indexOf('}',currentIndex);
			} else if (fieldValueFirstChar=='"') {
				currentIndex++;
				indexValue = message.indexOf('"',currentIndex);
			} else {
				indexValue = message.indexOf('\n',currentIndex);
			}
			if (indexValue<0) throw new Exception("ENS field not closed: "+fieldName);
			System.out.println(fieldName+" "+currentIndex+" "+indexValue);
			String fieldValue = message.substring(currentIndex,indexValue-1);
			fieldValue = trimWhitespaces(fieldValue);
			currentIndex = indexValue+1;
			return new Pair<String,String>(fieldName,fieldValue);
		}
		private static int skipWhitespaces(String message, int fromIndex) {
			int currentIndex = fromIndex;
			while(currentIndex<message.length()) {
				if (!Character.isWhitespace(message.charAt(currentIndex))) break;
				currentIndex++;
			};
			return currentIndex;
		}
		private static String trimWhitespaces(String msg) {
			String message = msg;
			int startIndex = 0;
			while(startIndex<message.length()) {
				if (!Character.isWhitespace(message.charAt(startIndex))) break;
				startIndex++;
			}
			int endIndex = message.length();
			while(endIndex>startIndex) {
				if (!Character.isWhitespace(message.charAt(endIndex-1))) break;
				endIndex--;
			}
			return message.substring(startIndex,endIndex);
		}
	}
	static Map<String,String> parse(String msg) throws Exception {
		Map<String,String> fields = new HashMap<String,String>();
		Parser parser = new Parser(msg);
		Pair<String,String> field = null;
		while ((field=parser.getNextField())!=null) {
			fields.put(field.getM1(), field.getM2());
		}
		return fields;
	}

	static Map<String,String> parse2(String msg) {
		Map<String,String> eids = new HashMap<String,String>();
		int startIndex = msg.indexOf("OldEID");
		if (startIndex<=0) {
			System.out.println("Missing field: OldEID");
			return eids;
		}
		startIndex = msg.indexOf("{",startIndex);
		if (startIndex<=0) {
			System.out.println("No opening bracket for field: OldEID");
			return eids;
		}
		int endIndex = msg.indexOf("}",startIndex);
		if (endIndex<=0) {
			System.out.println("No closing bracket for field: OldEID");
			return eids;
		}
		String oldEIDField = msg.substring(startIndex+1,endIndex-1);
		oldEIDField = oldEIDField.replace("\n", "").trim();
		if (oldEIDField.isEmpty()) {
			System.out.println("Ignoring empty field: OldEID");
			return eids;
		}
		System.out.println("Received field OldEID: '"+oldEIDField+"'");
		// 34877|Nairobi Securities Exchange, 39691|Nairobi Securities Exchange - Delayed
		String [] tokens = oldEIDField.split(",");
		for (String token : tokens) {
			String subTokens[] = token.trim().split("\\|");
			String eid = subTokens[0].trim();
			String name = "";
			if (subTokens.length>1)
				name = subTokens[1].trim();
			if (subTokens.length>2)
				System.out.println("EID description "+eid+" has more than 2 tokens: "+oldEIDField);
			eids.put(eid, name);
		}
		return eids;
	}
	static void test() throws Exception {
		System.out.println("Paresed content: "+parse(sampleMsg).toString());
	}

}
