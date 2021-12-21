package com.zstojkov.javatest;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.io.StringReader;
import java.lang.management.ManagementFactory;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.management.Attribute;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanServerConnection;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.ReflectionException;
import org.apache.commons.lang.StringUtils;
//import org.jboss.forge.roaster.Roaster;
//import org.jboss.forge.roaster.model.JavaType;
//import org.jboss.forge.roaster.model.JavaUnit;
//import org.jboss.forge.roaster.model.source.JavaClassSource;

import com.magtia.xhost.utils.Record;
import com.magtia.xhost.utils.RecordSetReaderCSV;
import com.magtia.xhost.utils.Utils;
import com.magtia.xhost.utils.Utils.Finder;

import au.com.bytecode.opencsv.CSVReader;


public class JavaTest {

	public static void javatest() throws Exception {
		matchtest();
	}
	
	

    public static void matchtest() {
    	
    	  String patternStr = "i.e.";

    	  System.out.println(Pattern.matches(patternStr, "i.e."));
    	    System.out.println(Pattern.matches(patternStr, "ibex")); 

    	    // Quote the pattern; i.e. surround with \Q and \E
    	    System.out.println(Pattern.matches("\\Q" + patternStr + "\\E", "i.e.")); 
    	    System.out.println(Pattern.matches("\\Q" + patternStr + "\\E", "ibex")); 


		System.out.println("F:30ABC\\DC.LN".matches("F:30ABC\\DC.LN"));
		System.out.println("F:30ABC\\DC.LN".matches("\\QF:30ABC\\DC.LN\\E"));
    }

	private static void regexescape() {
		System.out.println(escapeQuotes("F:30ABC\\DC.LN"));
	}
 
    static char[] escapeChars = "\\.?![]{}()<>*+-=^$|".toCharArray();
   public static String escapeQuotes(String str) {
        if(str != null && str.length() > 0) {
            return str.replaceAll("[\\W]", "\\\\$0"); // \W designates non-word characters
        }
        return "";
    }

	
	private static void parseGroovyFile() throws Exception {
		parseGroovySourceFile("/Users/zoran/Documents/workspace/JavaTest/bbg_script.groovy");
	}
	static private Map <String,String> source = new HashMap<String,String>();
	static private void parseGroovySourceFile(String filePath) throws Exception{
		int lineNo=0;
		String rawLine="";
		StringBuffer entitySource = new StringBuffer();
		try (BufferedReader reader = new BufferedReader(new FileReader(filePath))){
			String packageName = null;
			String currentClass = null;
			int openBracketCount=-1;
			int closedBracketCount=-1;
			while (( rawLine = reader.readLine())!=null) {
				lineNo++;
				int searchIndex = rawLine.indexOf("//");
				String line = searchIndex<0 ? rawLine : rawLine.substring(searchIndex);
				String searchString="package";
				String searchValue = getValueAfterKey(line,searchString);
				if (searchValue!=null) {
					if (packageName!=null) throw new Exception("package specified more than once");
					packageName = searchValue;
				}
				if (packageName==null) throw new Exception("package not specified in the first line");
				if (currentClass==null) {
					searchString = "class";
					String className = getValueAfterKey(line,searchString);
					if (className==null) continue;
					currentClass=packageName+"."+className;
					line = line.substring(line.indexOf(searchString));
					openBracketCount=0;
					closedBracketCount=0;
				}
				if (openBracketCount>=0) {
					// looking for { and } match
				    int i=0;
				    while (i<line.length() && (closedBracketCount!=openBracketCount || closedBracketCount==0)) {
			    		char c=line.charAt(i);
			    		if (c=='}') closedBracketCount++;
			    		else if(c=='{') openBracketCount++;
			    		i++;
				    }	
				}
				if (currentClass!=null)  {
					entitySource.append(rawLine);
					entitySource.append("\n");
				}
				if (closedBracketCount==openBracketCount && closedBracketCount>0) {
					// found { and matching }
					if (currentClass!=null) {
						System.out.println("-------------------------");
						System.out.println("Found class: "+currentClass);
						System.out.println(entitySource);
						
						extractMethods(entitySource.toString(),"(def|String|boolean|int)");
						currentClass=null;
						entitySource = new StringBuffer();
					}
				}
			}
			
		} catch (Exception e) {
			throw new Exception (String.format("File %s parsing exception: '%s' at line %d: %s ",filePath,e.getMessage(),lineNo,rawLine),e);
		}
		
	}
	static private void extractMethods(String sourceCode, String entityTypeMatch) throws Exception {
		int lineNo=0;
		String rawLine="";
		StringBuffer entitySource = new StringBuffer();
		try (BufferedReader reader = new BufferedReader(new StringReader(sourceCode))){
			String currentEntity = null;
			int openBracketCount=-1;
			int closedBracketCount=-1;
			while (( rawLine = reader.readLine())!=null) {
				lineNo++;
				int searchIndex = rawLine.indexOf("//");
				String line = searchIndex<0 ? rawLine : rawLine.substring(searchIndex);
				if (line.endsWith(";")) line=line.substring(0,line.length()-1);
				line=line.trim();

				if (currentEntity==null) {
					
					Pattern pattern = Pattern.compile("\\s+"+entityTypeMatch+"\\s+");
					Matcher matcher = pattern.matcher(line);
				    if (!matcher.find()) continue;
				    String entityType = line.substring(matcher.start(),matcher.end());
				    line = line.substring(matcher.end());
				    System.out.println("Found entity type: "+entityType);
					String[] tokens = line.split("[ \\(\\{]");
					String entityName = tokens[0];
					if (entityName.isEmpty()) throw new Exception("entity name not specified for "+entityType);
					currentEntity="PROCEDURE "+"."+entityName;
					line = line.substring(line.indexOf(entityName));
					openBracketCount=0;
					closedBracketCount=0;
				}
				if (openBracketCount>=0) {
					// looking for { and } match
				    int i=0;
				    while (i<line.length() && (closedBracketCount!=openBracketCount || closedBracketCount==0)) {
			    		char c=line.charAt(i);
			    		if (c=='}') closedBracketCount++;
			    		else if(c=='{') openBracketCount++;
			    		i++;
				    }	
				}
				if (currentEntity!=null)  {
					entitySource.append(rawLine);
					entitySource.append("\n");
				}
				if (closedBracketCount==openBracketCount && closedBracketCount>0) {
					// found { and matching }
					if (currentEntity!=null) {
						System.out.println("-------------------------");
						System.out.println("Found entity: "+currentEntity);
						System.out.println(entitySource);

						currentEntity=null;
						entitySource = new StringBuffer();
					}
				}
			}
			
		} catch (Exception e) {
			throw new Exception (String.format("Strin parsing exception: '%s' at line %d: %s ",e.getMessage(),lineNo,rawLine),e);
		}
		
	}
	static private String getStringAfterKey(String line, String key) {
		int index = line.indexOf(key);
		if (index<0) return null;
		return line.substring(index).trim();
	}
	static private String getValueAfterKey(String line, String key) {
		int index = line.indexOf(key);
		if (index<0) return null;
		String valueString = line.substring(index+key.length()).trim();
		if (valueString.isEmpty()) return null;
		String[] tokens = valueString.split("[ \\(\\{]");
		return tokens[0];
	}

//	public static void roaster_File() throws IOException {
//
//		String source = FileUtils.readFileToString(new File("/Users/zoran/Documents/workspace/JavaTest/bbg_script.groovy"));
//		JavaUnit unit = Roaster.parseUnit(source);
//	
//		JavaClassSource myClass = unit.getGoverningType();
//
//		for (int i=0; i<10; i++) {
//			System.out.println("-------------------------------------------------------------");
//			myClass = (JavaClassSource) unit.getTopLevelTypes().get(i);
//			System.out.println("myClass qualified name: "+myClass.getQualifiedName());
//			System.out.println("myClass methods: "+myClass.getMethods());
//			System.out.println("myClass code: "+source.substring(myClass.getStartPosition(),myClass.getEndPosition()));
//		
//		}
//	}
	
//	public static void roaster_string() {
//		String javaCode = ""
//				+"package com.zoran.xx\n"
//				+"public static int i; \n"
//				+"// class Comment\n"
//				+"public class MyClass{  \n"
//				+"   public class SubClass { \n"
//				+"    }  \n"
//				+"   private String field; \n"
//				+"      def fun(){}  \n"
//				+"      int intmethod(){}  \n"
//				+" } \n"
//				+"package com.zoran.xyy\n"
//				+"public class AnotherClass {}\n"
//				+"public static void global() {}\n"
//				;
//
//		JavaUnit unit = Roaster.parseUnit(javaCode);
//		System.out.println("unit.toUnformattedString(): "+unit.toUnformattedString());
//
//		JavaClassSource myClass = unit.getGoverningType();
//		
//		
//		
//		System.out.println("------------------------");
//		
//		myClass = (JavaClassSource) unit.getTopLevelTypes().get(0);
//		System.out.println("myClass.getStartPosition(): "+myClass.getStartPosition());
//		System.out.println("myClass.getEndPosition(): "+myClass.getEndPosition());
//		System.out.println("myClass code: "+javaCode.substring(myClass.getStartPosition(),myClass.getEndPosition()));
//		System.out.println("myClass methods: "+myClass.getMethods());
//		System.out.println("myClass qualified name: "+myClass.getQualifiedName());
//		System.out.println("myClass name: "+myClass.getName());
//		System.out.println("myClass canname: "+myClass.getCanonicalName());
//
//		System.out.println("------------------------");
//		myClass = (JavaClassSource) unit.getTopLevelTypes().get(1);
//		System.out.println("myClass.getStartPosition(): "+myClass.getStartPosition());
//		System.out.println("myClass.getEndPosition(): "+myClass.getEndPosition());
//		System.out.println("myClass qualified name: "+myClass.getQualifiedName());
//
//	}
	public static void matchingFiles() {
		List<Path> fileList = null;
		String searchPattern = "*.java";
		String searchPath = ".";
		try {
			Finder finder = new Utils.Finder(searchPattern);
			Files.walkFileTree(Paths.get(searchPath), finder);
			fileList = finder.getMatchesPaths();
			System.out.println(String.format("Files: %s ",fileList));
		} catch (Exception e) {
			System.out.println(String.format("Error while searching for a file: %s in %s",searchPattern,searchPath));
		}
	}

    public static void numberOfOpenFiles() throws MalformedObjectNameException, InstanceNotFoundException, ReflectionException, IOException{
    	ObjectName oName = new ObjectName("java.lang:type=OperatingSystem");
    	
    	   MBeanServerConnection conn = ManagementFactory.getPlatformMBeanServer();
		
    	javax.management.AttributeList list = conn.getAttributes(oName, new String[]{"OpenFileDescriptorCount", "MaxFileDescriptorCount"});
    	for(Attribute attr: list.asList()){
    	    System.out.println(attr.getName() + ": " + attr.getValue());
    	}
    }

	static void convertBBGDatafeedTaskConfig() throws Exception {
		Properties bbgProp = Utils.propertiesLoad(new File("/Users/zoran/Documents/workspace/XRICHost/XBBGReaderClient/config/bbgtool.properties"));
		try (BufferedWriter dfWriter = new BufferedWriter(new FileWriter("/Users/zoran/Documents/workspace/XRICHost/XHost/config/bbg_datafeeds_new.xml"))) {
			try (BufferedReader dfReader = new BufferedReader(new FileReader("/Users/zoran/Documents/workspace/XRICHost/XHost/config/bbg_datafeeds.xml"))) {
				String line = null;
				while((line = dfReader.readLine())!=null) {
					if (line.contains("bbgFileNameTemplate")) {
						String[] tokens = line.split("\\\"");
						if (tokens.length!=5) throw new Exception("Invalid number of tokerns: "+tokens.length+" in "+line);
						String command = bbgProp.getProperty("file."+tokens[3]);
						if (command==null) throw new Exception("Could not fine property: "+tokens[3]);
						line = tokens[0]+"\"bbgRequest\""+tokens[2]+"\""+command+"\""+tokens[4];
						System.out.println(line);
					}
					dfWriter.write(line+"\n");
				}
			}
		}		
	}
	static void regexMatch() {
		regexMatch("HUNT LN EQ","HUNT.L.*");
		regexMatch("HUNT LN EQ","^HUNT.*");
		regexMatch("HUNT LN EQ","HUNT.");
	}
	static void regexMatch(String str, String regex) {
		System.out.println(str+" matches "+regex+" "+str.matches(regex));
	}
	static void lastIndex() {
		String a = "a055500";
		String b = "55";
		System.out.println("lastIndexOf(b)="+a.lastIndexOf(b));
		System.out.println("lastIndexOf(b,5)="+a.lastIndexOf(b,5));
		System.out.println("lastIndexOf(b,4)="+a.lastIndexOf(b,4));
		System.out.println("lastIndexOf(b,3)="+a.lastIndexOf(b,3));
		System.out.println("lastIndexOf(b,2)="+a.lastIndexOf(b,2));
	}
	static void split() {
		String a = "x,b,c,,,,,d";
		String b = "x,b,c,,,,,";
		System.out.println("a: "+Arrays.asList(a.split(",",-1)));
		System.out.println("b: "+Arrays.asList(b.split(",",-1)));
	}

	static void compareStringMethods() throws Exception {
		List<String> lst = new ArrayList<String>();
		for (int i=0; i<20; i++) lst.add("value"+1);
		String[] arr = new String[lst.size()];
		arr = lst.toArray(arr);

		int iterations = 1000000;
		String csv = null;
		long startTime = System.currentTimeMillis();
		for (int k=0; k<iterations; k++)
			csv = listToCHSV1(arr,"null",',');
		System.out.println("csv: "+csv);
		System.out.println("listToCHSV1: "+(System.currentTimeMillis()-startTime));

		startTime = System.currentTimeMillis();
		for (int k=0; k<iterations; k++)
			csv = listToCHSV2(arr,"null",',');
		System.out.println("csv: "+csv);
		System.out.println("listToCHSV2: "+(System.currentTimeMillis()-startTime));

	}

	private static String listToCHSV1(Object[] list, String nullValue, char separator) {
		String str="";
		for (int i=0; i<list.length; i++) {
			str+=(list[i]==null) ? nullValue : list[i].toString().replaceAll(","," ").replaceAll("'"," ");
			if (i<list.length-1) str+=separator;
		}
		return str;
	}

	private static String listToCHSV2(Object[] list, String nullValue, char separator) {
		StringBuffer str = new StringBuffer();
		for (int i=0; i<list.length; i++) {
			Object o = list[i];
			if (o==null) {
				str.append(nullValue);
			} else {
				String s = o.toString();
				if (s.contains(",")) s=s.replaceAll(","," ");
				if (s.contains("'")) s=s.replaceAll("'"," ");
				str.append(s);
			}
			if (i<list.length-1) str.append(separator);
		}
		return str.toString();
	}

	static void serializationVsJson() throws Exception {
		Record record = new Record();
		for (int i=0; i<20; i++) record.put("key"+i, "value"+1);

		int iterations = 100000;
		Record r = null;
		String jRecord = null;
		long startTime = System.currentTimeMillis();
		for (int k=0; k<iterations; k++) {
			jRecord = record.toJSON();
			r = Record.fromJSON(jRecord);
		}
		System.out.println("jRecord: "+jRecord);
		System.out.println("jRecord: "+"len="+jRecord.length());
		System.out.println("jRecord: "+r);
		System.out.println("jRecord: "+(System.currentTimeMillis()-startTime));


		String sRecord = null;
		startTime = System.currentTimeMillis();
		for (int k=0; k<iterations; k++) {
			sRecord = toString(record);
			r = (Record) fromString(sRecord);
		}
		System.out.println("sRecord: "+sRecord);
		System.out.println("sRecord: "+"len="+sRecord.length());
		System.out.println("sRecord: "+r);
		System.out.println("sRecord: "+(System.currentTimeMillis()-startTime));

		byte[] bRecord = null;
		startTime = System.currentTimeMillis();
		for (int k=0; k<iterations; k++) {
			bRecord = record.toByteArray();
			r = Record.fromByteArray(bRecord);
		}
		System.out.println("bRecord: "+"len="+bRecord.length);
		System.out.println("bRecord: "+r);
		System.out.println("bRecord: "+(System.currentTimeMillis()-startTime));

	}

	private static Object fromString( String s ) throws IOException,ClassNotFoundException {
		byte [] data = Base64.getDecoder().decode( s );
		ObjectInputStream ois = new ObjectInputStream(
		new ByteArrayInputStream(  data ) );
		Object o  = ois.readObject();
		ois.close();
		return o;
	}
    private static String toString( Serializable o ) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream( baos );
        oos.writeObject( o );
        oos.close();
        return Base64.getEncoder().encodeToString(baos.toByteArray());
    }

	static void regex() {
		testRegex("1W","[1-5]W");
		testRegex("124","[0-9]{3}");
		testRegex("124","\\d{3}");
		testRegex("abcd/123456/nesto",".+/\\d{6}/.+");

	}


	static void PairingTest() throws Exception {
		printPairs(getFilePairsWithTheSameSuffix2(
				new ArrayList<String>(Arrays.asList("ABC-L2-XRIC.xam","ABC-X-XRIC.xam","ABC-XRIC.xam","ABC-CHAINS.xac")),
				new ArrayList<String>(Arrays.asList("CD-E-L2-XRIC.xam","CD-E-X-XRIC.xam","CD-E-CHAINS.xac"))));
		printPairs(getFilePairsWithTheSameSuffix2(
				new ArrayList<String>(Arrays.asList("ABC-E-L2-XRIC.xam","ABC-E-X-XRIC.xam","ABC-E-XRIC.xam","ABC-E-CHAINS.xac")),
				new ArrayList<String>(Arrays.asList("CD-E-L2-XRIC.xam","CD-E-XRIC.xam","CD-E-CHAINS.xac"))));
		printPairs(getFilePairsWithTheSameSuffix2(
				new ArrayList<String>(Arrays.asList("ABC-L2-XRIC.xam","ABC-X-XRIC.xam","ABC-XRIC.xam","ABC-CHAINS.xac","ABC-CHNRIC.xac")),
				new ArrayList<String>(Arrays.asList("CD-E-XRIC.xam","CD-E-CHAINS.xac"))));
		printPairs(getFilePairsWithTheSameSuffix2(
				new ArrayList<String>(Arrays.asList("ABC-L2-XRIC.xam","ABC-X-XRIC.xam","ABC-XRIC.xam","ABC-CHAINS.xac")),
				new ArrayList<String>(Arrays.asList("CD-E-XRIC.xam","CD-E-CHAINS.xac","CD-E-CHNRIC.xac"))));
		printPairs(getFilePairsWithTheSameSuffix2(
				new ArrayList<String>(Arrays.asList("ABC-L2-XRIC.xam","ABC-XRIC.xam")),
				new ArrayList<String>(Arrays.asList("CDE-L2-XRIC.xam","CDE-XRIC.xam"))));
		printPairs(getFilePairsWithTheSameSuffix2(
				new ArrayList<String>(Arrays.asList("AB-C-L2-XRIC.xam","AB-C-XRIC.xam")),
				new ArrayList<String>(Arrays.asList("CDE-L2-XRIC.xam","CDE-XRIC.xam"))));
		printPairs(getFilePairsWithTheSameSuffix2(
				new ArrayList<String>(Arrays.asList("ABC-L2-XRIC.xam","ABC-XRIC.xam")),
				new ArrayList<String>(Arrays.asList("CD-E-L2-XRIC.xam","CD-E-XRIC.xam"))));
	}
	private static void printPairs(List<Utils.Pair<String,String>> pairs){
		for (Utils.Pair<String,String> pair : pairs)
			System.out.println("p: "+pair.getM1()+" - "+pair.getM2());
	}
	private static Comparator<String> comp = new Comparator<String>() {
		@Override
		public int compare(String o1, String o2) {
			try {
				return new Integer(StringUtils.countMatches(o2, "-")).
						compareTo(StringUtils.countMatches(o1, "-"));
			} catch (Exception e) {
				System.out.println(e.getMessage());
				return 0;
			}
		}
	};

	private static List<Utils.Pair<String,String>> getFilePairsWithTheSameSuffix2(List<String> filesToCompare1, List<String> filesToCompare2) throws Exception {

		// sort files based on number of tokens
		filesToCompare1.sort(comp);
		//filesToCompare2.sort(comp);
		System.out.print("----- list: ");
		for (String file1 : filesToCompare1) System.out.print(file1+",");
		System.out.println();

		List<Utils.Pair<String,String>> pairs = new ArrayList<Utils.Pair<String,String>>();

		while (filesToCompare1.size()>0) {
			String file1 = filesToCompare1.get(0);
			String file1Tokens = file1;
			List<String> matchingFiles1 = new ArrayList<String>();
			List<String> matchingFiles2 = new ArrayList<String>();
			do {
				matchingFiles1.clear();
				matchingFiles2.clear();
				for (String file2 : filesToCompare2)
					if (file2.endsWith(file1Tokens))
						matchingFiles2.add(file2);
				for (String f1 : filesToCompare1)
					if (f1.endsWith(file1Tokens))
						matchingFiles1.add(f1);
				if (matchingFiles2.size()>0) break;
				// remove first token
				int index = file1Tokens.indexOf('-',1);
				if (index<0) break; // that was last token
				file1Tokens=file1Tokens.substring(index);
			} while (true);
			for (String f1 : matchingFiles1) {
				if (matchingFiles2.size()==0)
					pairs.add(new Utils.Pair<String, String>(f1, null));
				else for (String file2 : matchingFiles2) {
					pairs.add(new Utils.Pair<String, String>(f1, file2));
				}
				filesToCompare1.remove(f1);
			}
			for (String f2 : matchingFiles2)
				filesToCompare2.remove(f2);
		}

		for (String file2 : filesToCompare2)
				pairs.add(new Utils.Pair<String, String>(null, file2));

		return pairs;
	}

	private static List<Utils.Pair<String,String>> getFilePairsWithTheSameSuffix2a(List<String> filesToCompare1, List<String> filesToCompare2) throws Exception {

		// sort files based on number of tokens
		filesToCompare1.sort(comp);
		//filesToCompare2.sort(comp);
		System.out.print("----- list: ");
		for (String file1 : filesToCompare1) System.out.print(file1+",");
		System.out.println();

		List<Utils.Pair<String,String>> pairs = new ArrayList<Utils.Pair<String,String>>();

		for (String file1 : filesToCompare1) {
			String file1Tokens = file1;
			List<String> matchingFiles2 = new ArrayList<String>();
			do {
				for (String file2 : filesToCompare2)
					if (file2.endsWith(file1Tokens))
						matchingFiles2.add(file2);
				if (matchingFiles2.size()>0) break;
				// remove first token
				int index = file1Tokens.indexOf('-',1);
				if (index<0) break; // that was last token
				file1Tokens=file1Tokens.substring(index);
			} while (true);
			if (matchingFiles2.size()==0)
				pairs.add(new Utils.Pair<String, String>(file1, null));
			else for (String file2 : matchingFiles2) {
				pairs.add(new Utils.Pair<String, String>(file1, file2));
				if (matchingFiles2.size()==1) filesToCompare2.remove(file2);
			}
		}

		for (String file2 : filesToCompare2) {
			// for each file in folder 2 check if it appears in any of the pairs
			boolean fileUsed = false;
			for (Utils.Pair<String,String> pair : pairs)
				if (pair.getM2()!=null && file2.equals(pair.getM2()))
					fileUsed = true;
			// the file is not in any of the pairs then record a pair with "null" file from the first folder
			if (!fileUsed)
				pairs.add(new Utils.Pair<String, String>(null, file2));
		}
		return pairs;
	}

	public static void CSVReaderTest() throws IOException  {
		String rmsLine = "LME.AUX,Success,AUX,AUD,Description,Type<Equity>Description<\"LIMEADE CDI FOR>";
//		String rmsLine = "LME.AUX,Success,AUX,AUD,Description,Type<Equity>Description<\"LIMEADE CDI FOR\">";
//		CSVReader csvReader = new CSVReader(new StringReader(rmsLine),',');
//		CSVReader csvReader = new CSVReader(new StringReader(rmsLine),',',CSVParser.DEFAULT_QUOTE_CHARACTER,(char)0x1B);
		CSVReader csvReader = new CSVReader(new StringReader(rmsLine),',',(char)0);

		List<String>tokens = Arrays.asList(csvReader.readNext());
		System.out.println(rmsLine+" -----> "+tokens);
		csvReader.close();
	}

	public static void BigDecimalTest1 () {
		BigDecimalConvert1("33.3","1");
	}
	public static void BigDecimalConvert1 (String formattedStrikePrice , String strikeMultiplier) {
		BigDecimal bdStrike;
		try {
			bdStrike = new BigDecimal(formattedStrikePrice);
		} catch (NumberFormatException nfe) {
			// for some reason a message for NumberFormatException is 'null', so just show a bit more info
			System.out.println("NumberFormatException in formattedStrikePrice: "+formattedStrikePrice);
			return;
		}
		bdStrike = bdStrike.multiply(new BigDecimal(strikeMultiplier)).stripTrailingZeros();
		System.out.println(formattedStrikePrice+"("+strikeMultiplier+") -> "+bdStrike.toPlainString());
	}
	public static void BBGSymbolParserTest() {
		System.out.println( new BBGSymbolParser("abcd 7 C33 Equity").toString());
		System.out.println( new BBGSymbolParser("abcd 7 C33 PIT Equity").toString());
		System.out.println( new BBGSymbolParser("abcd GB 7 C33 PIT Equity").toString());
		System.out.println( new BBGSymbolParser("abcd 33 Equity").toString());
		System.out.println( new BBGSymbolParser("abcd 33 Index").toString());
		System.out.println( new BBGSymbolParser("abcd GB 7/99 C33.00 PIT Equity").toString());
		System.out.println( new BBGSymbolParser("abcd GB 7/18/99 C33 PIT Equity").toString());
		System.out.println( new BBGSymbolParser("abcd GB 7 C33 PIT Equity").toString());

	}
	public static void dateTimeParsing() throws ParseException {
		SimpleDateFormat format = new SimpleDateFormat("EEE");
		Date d = format.parse("Tue");
		System.out.println("Date: "+d.toString());
		format = new SimpleDateFormat("HHmm");
		d = format.parse("2300");
		System.out.println("Date: "+d.toString());
		d = format.parse("3300");
		System.out.println("Date: "+d.toString());
	}

	public static void taskTimes() throws Exception {
		Path filePath = Paths.get("/Users/zoran/temp/tasktime.csv");
		int timeUnit=60000; // in msec
		Map<Long,Set<String>> tasksPerTimeUnit = new HashMap<Long,Set<String>>();
		RecordSetReaderCSV reader = new RecordSetReaderCSV(filePath);
		reader.open();
		Record record;
		while((record=reader.getNextRecord())!=null) {
			String taskName = record.getNotEmptyStringEx("Task".toUpperCase());
			int duration = record.getIntegerEx("ProcessDuration".toUpperCase());
			SimpleDateFormat format = new SimpleDateFormat("yyyyMMdd_HHmmss");
			long startTime = format.parse(record.getNotEmptyStringEx("ProcessStart".toUpperCase())).getTime();
			long endTime = format.parse(record.getNotEmptyStringEx("ProcessEnd".toUpperCase())).getTime();
			long currentTime = startTime-(startTime%timeUnit);
			while (currentTime<=endTime) {
				Set<String> tasks = tasksPerTimeUnit.get(currentTime);
				if (tasks==null) {
					tasks = new HashSet<String>();
					tasksPerTimeUnit.put(currentTime, tasks);
				}
				tasks.add(taskName);
				currentTime+=timeUnit;
			}
		}
		reader.close();
		List<Long> keys = new ArrayList<Long>(tasksPerTimeUnit.keySet());
		Collections.sort(keys);
		long endTime = keys.get(keys.size()-1);
		for (long currentTime = keys.get(0); currentTime<=endTime; currentTime+=timeUnit) {
			Set<String> tasks = tasksPerTimeUnit.get(currentTime);
			System.out.println(String.format("%s,%d,%s",new Date(currentTime).toString(),tasks==null ? 0 : tasks.size(),(tasks==null ? "" : tasks.toString()).replaceAll(",|\\]|\\[", "")));
		}
	}

	public static void yearStringFromYearCode() throws Exception {
		yearStringFromYearCode("0");
		yearStringFromYearCode("1");
		yearStringFromYearCode("4");
		yearStringFromYearCode("8");
		yearStringFromYearCode("9");
		yearStringFromYearCode("17");
		yearStringFromYearCode("18");
		yearStringFromYearCode("19");
		yearStringFromYearCode("20");
		yearStringFromYearCode("24");
		yearStringFromYearCode("000");
		yearStringFromYearCode("008");
		yearStringFromYearCode("009");
		yearStringFromYearCode("010");
		yearStringFromYearCode("019");
		yearStringFromYearCode("020");
		yearStringFromYearCode("024");
		yearStringFromYearCode("120");
		yearStringFromYearCode("220");
	}

	// yearCodeString - is a number string that can be 1 to 4 digits long (last digits of a year)
	public static void yearStringFromYearCode(String yearCodeString) throws Exception {
		if (yearCodeString==null)
			throw new Exception("YearCodeString is null");
		int yearCodeLength = yearCodeString.length();
		if (yearCodeLength!=yearCodeString.trim().length())
			throw new Exception("YearCodeString contains spaces: '"+yearCodeString+"'");
		if (yearCodeLength==0 || yearCodeLength>4)
			throw new Exception("YearCodeString length is not 1 to 4: '"+yearCodeString+"'");
		int yearCode = 0;
		try {
			yearCode = Integer.parseInt(yearCodeString);
		} catch (Exception e) {
			throw new Exception("Failed to parse yearCodeString: "+yearCodeString);
		}
		String currentYearStamp = "2019"; // 4 digit date
		int currentYear = Integer.parseInt(currentYearStamp);
		int year = yearCode;
		if (yearCodeLength<4) {
			String yearStamp = currentYearStamp.substring(0,4-yearCodeLength)+yearCodeString;
			year = Integer.parseInt(yearStamp);
			if (year<currentYear) {
				int yearAdjustment = 10;
				for (int i=1; i<yearCodeLength;i++) yearAdjustment=10*yearAdjustment;
				year+=yearAdjustment;
			}
		}
		System.out.println(String.format("%s -> %s", yearCodeString,Integer.toString(year)));
	}

	static void dptest_main() {
		dptest(0.15,3);
		dptest(1.5,3);
		dptest(15,3);
		dptest(150,3);
		dptestNP(0.15,3);
		dptestNP(1.5,3);
		dptestNP(15,3);
		dptestNP(150,3);

	}
	static void dptest(double strikePrice, int minDp) {

		DecimalFormat format = new DecimalFormat("0.#######");
		String formattedStrikPriceForRic;

		formattedStrikPriceForRic = format.format(strikePrice);
		int dpIndex = formattedStrikPriceForRic.indexOf('.');
		int dps = 0;
		if (dpIndex>=0) {
			String beforeDP = formattedStrikPriceForRic.substring(0,dpIndex);
			String afterDP = formattedStrikPriceForRic.substring(dpIndex+1);
			// remove trailing 0s after DP
			while (afterDP.endsWith("0"))
				afterDP = afterDP.substring(0,afterDP.length()-1);
			dps = afterDP.length();
			formattedStrikPriceForRic = beforeDP+afterDP;
		}
		while(dps++<minDp)
			formattedStrikPriceForRic = formattedStrikPriceForRic+"0";
		System.out.println(String.format("%f(%d) -> %s", strikePrice,minDp,formattedStrikPriceForRic));
	}
	static void dptestNP(double strikePrice, int minDp) {

		DecimalFormat format = new DecimalFormat(".#######");
		String formattedStrikPriceForRic;

		formattedStrikPriceForRic = format.format(strikePrice);
		int dpIndex = formattedStrikPriceForRic.indexOf('.');
		int dps = 0;
		if (dpIndex>=0) {
			String beforeDP = formattedStrikPriceForRic.substring(0,dpIndex);
			String afterDP = formattedStrikPriceForRic.substring(dpIndex+1);
			// remove trailing 0s after DP
			while (afterDP.endsWith("0"))
				afterDP = afterDP.substring(0,afterDP.length()-1);
			dps = afterDP.length();
			formattedStrikPriceForRic = beforeDP+afterDP;
		}
		while(dps++<minDp)
			formattedStrikPriceForRic = formattedStrikPriceForRic+"0";
		System.out.println(String.format("%f(%d) -> %s", strikePrice,minDp,formattedStrikPriceForRic));
	}

	private static boolean matchSymbolWithRIC(String ric, String symbol) {
		// get RIC portion before last '.'
		int index = ric.lastIndexOf('.');
		String strRic = index>=0 ? ric.substring(0,index) : ric;
		// Ticker or Symbol portion after ':'
		index = symbol.indexOf(':');
		String strSymbol = index>=0 ? symbol.substring(index+1) : symbol;
		// clean any special character and convert to upper case
	    Pattern pattern = Pattern.compile("[^0-9a-zA-Z]");
	    Matcher matcher = pattern.matcher(strSymbol);
	    strSymbol = matcher.replaceAll("").toUpperCase();
	    matcher = pattern.matcher(strRic);
	    strRic = matcher.replaceAll("").toUpperCase();
	    // compare cleaned strings
		boolean match = strRic.compareTo(strSymbol) == 0;
		System.out.println("["+ric+"]["+symbol+"] -> ["+strRic+"]-["+strSymbol+"] = "+match);
		return match;
	}

	public static void test1(String[] args) {
		matchSymbolWithRIC(" 12/zX AA5 - 6.Lx","E7: 12/zX AA5 - 6");
		matchSymbolWithRIC(" 12?zX=AA5!-,@+-_^~6"," 12?zx aa5 - 6");
		matchSymbolWithRIC(" 12/zX AA5 - 6"," 12/zX aA5 - 6");
		matchSymbolWithRIC(" 12/zX AA56"," 12/zX aA5 - 6");
		matchSymbolWithRIC(" 12/zX AA56","12zXaA56");
		matchSymbolWithRIC(" 13/zX AA5 - 6"," 12/zX aA5 - 6");

	}

	public class XBigDecimalTest {
		private BigDecimal bd;
		private XBigDecimalTest(String bdStr) {bd=new BigDecimal(bdStr);}

		private XBigDecimalTest(BigDecimal bd) {this.bd=bd;}

		public XBigDecimalTest multiply(int multiplier) {
			bd = bd.multiply(new BigDecimal(multiplier));
			return this;
		}
		public XBigDecimalTest setScale(int scale) {
			bd = bd.setScale(scale);
			return this;
		}
		public int scale() { return bd.scale(); }

		public XBigDecimalTest removeDP() {
			bd = bd.multiply(new BigDecimal(bd.scale()));
			return this;
		}
		// xbd.multiply(100).setScale(3);
	}

	public static void timeTest() {
		Calendar cal = GregorianCalendar.getInstance();
		long ct = cal.getTimeInMillis();
		cal.set(2017, 3, 1,12,00);
		cal.setTimeInMillis(1491044453461L);
		long bt = cal.getTimeInMillis();
		System.out.println(bt);
		System.out.println(ct);
		System.out.println(ct>bt ? "bomb" : "ok");


	}

	public static void dateParsingTest() throws Exception {
		parseDateTime("23/10/58","dd/MM/yy");
		parseDateTime("11","MM");
		parseDateTime("7","MM");
		parseDateTime("01","MM");
		parseDateTime("10/58","MM/yy");
		parseDateTime("1/1958","MM/yy");
	}

	private static void parseDateTime(String dateTime, String format) {
		try {
				Date date = new SimpleDateFormat(format).parse(dateTime);
				System.out.println(format+" "+dateTime+" -> "+date.toString());
		} catch (Exception e) {
			System.out.println(format+" "+dateTime+" -> error");
		}
	}
	public static void timeParsingTest() throws Exception {
		System.out.println(formatDate("2013-11-12+00:00","yyyy-MM-dd","yyyMMdd"));
		System.out.println(formatDate("2013-11-12+00:22","yyyy-MM-dd+HH:mm","yyyMMdd_HHmm"));
		System.out.println(formatDate("2013-11-12","yyyy-MM-dd","yyyMMdd"));
	}

	public static String formatDate(String inputDateString, String inputDateFormat, String outputDateFormat) throws Exception  {

		Date date = null;
		try {
			date = new SimpleDateFormat(inputDateFormat).parse(inputDateString);
		} catch (ParseException e) {
			throw new Exception("Expected date format is "+inputDateFormat+" but input string is: "+inputDateString);
		}
		return new SimpleDateFormat(outputDateFormat).format(date);
	}

	public static void timeZonetest1() {

		String[] ids = TimeZone.getAvailableIDs();
		for (String id : ids) {
			System.out.println(displayTimeZone(TimeZone.getTimeZone(id)));
		}

		System.out.println("\nTotal TimeZone ID " + ids.length);

	}

	private static String displayTimeZone(TimeZone tz) {

		long hours = TimeUnit.MILLISECONDS.toHours(tz.getRawOffset());
		long minutes = TimeUnit.MILLISECONDS.toMinutes(tz.getRawOffset())
                                  - TimeUnit.HOURS.toMinutes(hours);
		// avoid -4:-30 issue
		minutes = Math.abs(minutes);

		String result = "";
		if (hours > 0) {
			result = String.format("(GMT+%d:%02d) %s", hours, minutes, tz.getID());
		} else {
			result = String.format("(GMT%d:%02d) %s", hours, minutes, tz.getID());
		}

		return result;

	}

	public static void timeZonetest2() {

		String timeZone = "Japan";

		Date date = new Date();
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

		// Use Madrid's time zone to format the date in
		df.setTimeZone(TimeZone.getTimeZone(timeZone));


		Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone(timeZone));
		System.out.println("Callendar date in "+timeZone+" is: "+calendar.getTime());

		System.out.println("Time in "+timeZone+" is: "+(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(calendar.getTime())));
		System.out.println("Time in "+timeZone+" is: "+df.format(date));

        LocalDateTime localNow = LocalDateTime.now(TimeZone.getTimeZone(timeZone).toZoneId());
        System.out.println(localNow);
        // Prints current time of given zone without zone information : 2016-04-28T15:41:17.611
        ZonedDateTime zoneNow = ZonedDateTime.now(TimeZone.getTimeZone("Europe/Madrid").toZoneId());
        System.out.println(zoneNow);
        // Prints current time of given zone with zone information : 2016-04-28T15:41:17.627+02:00[Europe/Madrid]

        System.out.println(localNow.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));
        System.out.println(localNow.format(DateTimeFormatter.ofPattern("HHmm")));

        //ZoneId timeZoneId = ZoneId.of("GMT");

        ZoneId timeZoneId1 =  ZoneId.of("Asia/Tokyo");
        ZoneId timeZoneId2 =  ZoneId.of("Europe/London");

//        ZonedDateTime resetTime =  ZonedDateTime.now().withHour(5).withMinute(15);
 //       System.out.println("resetTime="+resetTime.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));

        ZonedDateTime resetTime1 = ZonedDateTime.now().withZoneSameInstant(timeZoneId1).withHour(7).withMinute(15);
        System.out.println("resetTime1="+resetTime1.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));
        System.out.println(resetTime1.format(DateTimeFormatter.ofPattern("HHmm")));

        ZonedDateTime resetTime2 = resetTime1.withZoneSameInstant(timeZoneId2);
        System.out.println("resetTime2="+resetTime2.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));
        System.out.println(resetTime2.format(DateTimeFormatter.ofPattern("HHmm")));

        ZonedDateTime today = ZonedDateTime.now().withHour(0).withMinute(0).withSecond(0);
        System.out.println("today default zone: "+today.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));

        ZonedDateTime zoneToday = today.withZoneSameInstant(ZoneId.of("Asia/Tokyo"));
        System.out.println("zone start of the day : "+zoneToday.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));
        ZonedDateTime uKToday = zoneToday.withZoneSameInstant(ZoneId.of("Europe/London"));
        System.out.println("zone start of the day in UKtime: "+uKToday.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));

        zoneNow = ZonedDateTime.now().withZoneSameInstant(ZoneId.of("Asia/Tokyo"));
        System.out.println("zone now : "+zoneNow.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));

        System.out.println("Zone now : "+ZonedDateTime.now());
        Date dateNow = Date.from(ZonedDateTime.now().toInstant());
        System.out.println("Date now : "+dateNow+"("+dateNow.getTime()+")");
        zoneNow = ZonedDateTime.ofInstant(dateNow.toInstant(), ZoneId.systemDefault());
        System.out.println("Zone now from date : "+zoneNow);

        System.out.println();
        System.out.println("just Date: "+new Date());
        System.out.println("Zone AT now : "+ZonedDateTime.now().withZoneSameInstant(ZoneId.of("Asia/Tokyo")));
        dateNow = Date.from(ZonedDateTime.now().withZoneSameInstant(ZoneId.of("Asia/Tokyo")).toInstant());
        System.out.println("Date now from AT zone: "+dateNow+"("+dateNow.getTime()+")");
        zoneNow = ZonedDateTime.ofInstant(dateNow.toInstant(), ZoneId.of("Asia/Tokyo"));
        System.out.println("Zone AT now from date : "+zoneNow);
        System.out.println("Zone AT offset : "+zoneNow.getOffset());
        System.out.println("Zone AT offset in sec : "+zoneNow.getOffset().getTotalSeconds());
        zoneNow = ZonedDateTime.ofInstant(dateNow.toInstant(), ZoneId.systemDefault());
        System.out.println("Zone now from date : "+zoneNow);

	}

	public static void tztest(String[] args) throws Exception {

	       System.out.println("Time : "+new Date(17914L*24*60*60*1000).toString());
	       System.out.println("Time : "+new Date(19013L*24*60*60*1000).toString());
	       System.out.println("Time : "+new Date(18642L*24*60*60*1000).toString());
	       System.out.println("Time : "+new Date(18278L*24*60*60*1000).toString());
	       System.out.println("Time : "+new Date(17550L*24*60*60*1000).toString());
	       //		timeZonetest2();
	}

	public static List<String> getScriptLines(String scriptFile, String scriptName) throws Exception {
		List<String> scriptLines = new ArrayList<String>();
		BufferedReader reader = new BufferedReader(new FileReader(scriptFile));
		String line;
		int bracketCount = -1;
		boolean readingComment=false;
		boolean readingScript=false;
		while((line = reader.readLine()) != null){
			String codeLine = line;
			if (!readingComment && codeLine.contains("/*")) readingComment=true;
			if (readingComment && codeLine.contains("*/")) readingComment=false;
			if (readingComment) continue;
			if (codeLine.contains("//"))
				codeLine=codeLine.substring(0, line.indexOf("//"));
			if (!codeLine.contains(scriptName) && !readingScript) continue;
			if (!readingScript) {
				readingScript=true;
				bracketCount=0;
			}
			scriptLines.add(line);
			int bracketIndex=-1;
			do {
				bracketIndex = codeLine.indexOf("{", bracketIndex+1);
				if (bracketIndex>=0) bracketCount++;
			} while (bracketIndex>=0);
			bracketIndex=-1;
			do {
				bracketIndex = codeLine.indexOf("}", bracketIndex+1);
				if (bracketIndex>=0) bracketCount--;
			} while (bracketIndex>=0);
			if (bracketCount==0) break;
		}
		reader.close();
		return scriptLines;
	}

	static void scriptTest() throws Exception {
		String filePath="/Users/zoran/Documents/workspace/XRICHost/XHost/scripts/nashorn/bbg_processors.js";
		String scriptName="FormatStrikePrice_CBT";
		List<String> scriptLines = getScriptLines(filePath,scriptName);
		System.out.println("-------- Script: "+scriptName);
		for (String ln : scriptLines)
			System.out.println("> "+ln);
		System.out.println("-------- Script End ");
	}

	static void testRegex(String str, String regex) {
		System.out.println(str+".matches("+regex+")="+str.matches(regex));
	}

	private static ZoneId configuredTimeZoneId = ZoneId.of("Europe/Moscow");;
	private static ZoneId localTimeZoneId = ZoneId.of("Europe/London");;

	public static String getExchangeLastMidnightAsLocalTime() {
        ZonedDateTime zoneTime = ZonedDateTime.now().withZoneSameInstant(configuredTimeZoneId).withHour(0).withMinute(0).withSecond(0).withNano(0);
        ZonedDateTime localTime = zoneTime.withZoneSameInstant(localTimeZoneId);
        return localTime.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
	}

	public static String getExchangeTimeFromLocalTime(String localTimeStamp) {
		int year = Integer.parseInt(localTimeStamp.substring(0, 4));
		int month = Integer.parseInt(localTimeStamp.substring(4, 6));
		int day = Integer.parseInt(localTimeStamp.substring(6, 8));
		int hour = Integer.parseInt(localTimeStamp.substring(9, 11));
		int min = Integer.parseInt(localTimeStamp.substring(11, 13));
		int sec = Integer.parseInt(localTimeStamp.substring(13, 15));
        ZonedDateTime localTime = ZonedDateTime.of(year,month,day,hour,min,sec,0,localTimeZoneId);
        ZonedDateTime exchangeTime = localTime.withZoneSameInstant(configuredTimeZoneId);
        return exchangeTime.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
	}

	public static void test() {
		getExchangeLastMidnightAsLocalTime();
		System.out.println("Exchange Midnight: "+getExchangeLastMidnightAsLocalTime());
		System.out.println("Exchange Time: "+getExchangeTimeFromLocalTime("20180606_121212"));
	}

	public static int getWeekNumber(String xhostDate) throws ParseException {
		GregorianCalendar pCal = new GregorianCalendar();
		pCal.setTime(new SimpleDateFormat("yyyyMMdd").parse(xhostDate));
		return pCal.get(GregorianCalendar.WEEK_OF_MONTH);
	}
	public static void extractYearCode(String monthString, String yearString) throws Exception {
		if (yearString==null || yearString.trim().length()<2 || yearString.trim().length()>4)
			throw new Exception("Unexpected yearString content: "+yearString);
		int year = 0;
		try {
			// check if the year string is OK and calculate real year if yearString is only 2 or 3 digits
			year = Integer.parseInt(yearString.trim());
			if (year<10)
				throw new Exception("Unexpected yearString integer value: "+year);
			if (year<1000) year+=2000;
		} catch (Exception e) {
			throw new Exception("Failed to parse yearString: "+yearString);
		}

		SimpleDateFormat dateFormat = new SimpleDateFormat("MM/yyyy");
		Date recordDate = dateFormat.parse(monthString+"/"+Integer.toString(year));
		Date twoYearDate = null;
		String twoDigitsStartFromInMasterTable = "01/2019";
		if (twoDigitsStartFromInMasterTable!=null) {
			twoYearDate = dateFormat.parse(twoDigitsStartFromInMasterTable);
		}
		int yearCodeLength = 1;

		System.out.println("recordDate="+dateFormat.format(recordDate));
		System.out.println("twoYearDate="+dateFormat.format(twoYearDate));
		System.out.println("yearCodeLength="+yearCodeLength);
		if (twoYearDate!=null && recordDate.compareTo(twoYearDate)>=0)
			yearCodeLength = 2;

		System.out.println("yearCodeLength="+yearCodeLength);
	}


}
