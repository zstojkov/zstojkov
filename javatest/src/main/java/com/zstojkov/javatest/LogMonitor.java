package com.zstojkov.javatest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import org.apache.commons.io.FileUtils;

public class LogMonitor {

	private static final String logMonitorFolder = "logMonitor";
	
	// This code can work with 1 byte Charset only and unix log files where EOL char is a single character.
	// A different Charset or EOL char may cause miss-calculation in text length and position in log files.
	// A different approach could be to read whole log file each time to get all matched lines and compare matched lines to a previous run.
	private static final Charset charset = StandardCharsets.UTF_8;
	
	public static enum LogMonitorArguments {id,filePath,inclusinRegex,exclusionRegex}

	public static String checkLogFile(Map<LogMonitorArguments,String> request) {

		try {
			new File(logMonitorFolder).mkdirs(); // make sure the folder exists
			
			String id = request.get(LogMonitorArguments.id);
			String filePath = request.get(LogMonitorArguments.filePath);
			String inclusionRegex = request.get(LogMonitorArguments.inclusinRegex);
			String exclusionRegex = request.get(LogMonitorArguments.exclusionRegex);
			if (id==null || id.trim().length()==0) throw new Exception("File id can not be empty");
			if (id==filePath || filePath.trim().length()==0) throw new Exception("File path can not be empty");
			if (id==inclusionRegex || inclusionRegex.trim().length()==0) throw new Exception("inclusionRegex can not be empty");
			if (id!=exclusionRegex && exclusionRegex.trim().length()==0) exclusionRegex=null;
			inclusionRegex=".*("+inclusionRegex+").*";
			if (exclusionRegex!=null)
				exclusionRegex=".*("+exclusionRegex+").*";
			return checkLogFile(id,filePath,inclusionRegex,exclusionRegex);
		} catch (Exception e) {
			e.printStackTrace();
			return "LogMonitor internal error: "+e.getClass().getName()+" "+e.getMessage();
		}
	}
	
	private static String checkLogFile(String uniqueId, String logFilePath, String inclusionRegex, String exclusionRegex) throws IOException {
		
		File logFile = new File(logFilePath);
		if (!logFile.exists()) return "";

		
		File applogCountersFile = Paths.get(logMonitorFolder,"applogCounters-"+uniqueId+".txt").toFile();
		if (!applogCountersFile.exists())
			FileUtils.writeStringToFile(applogCountersFile, "0", charset,false);

		long currentPostion = Long.parseLong(FileUtils.readFileToString(applogCountersFile,charset));
		long fileLength = logFile.length();

		if (currentPostion==fileLength) return ""; // nothing new in the file
		if (currentPostion>fileLength)
			currentPostion=0L;	// new log file created
		
		StringBuffer matchingLines = new StringBuffer();
		// Check logs for matching strings from the last checked position
		try (BufferedReader reader = new BufferedReader(new FileReader(logFile))){
			reader.skip(currentPostion); // chars to skip
			String line;
			while((line=reader.readLine())!=null) {
				currentPostion+=(line.length()+1);
				//System.out.println("read line: "+line);
				if (!line.matches(inclusionRegex)) continue;
				if (exclusionRegex!=null &&
						line.matches(exclusionRegex)) continue;
				matchingLines.append(line);
				matchingLines.append("\n");
			}	
		}
		FileUtils.writeStringToFile(applogCountersFile, Long.toString(currentPostion), charset,false);
		//System.out.println(applogCountersFile.getAbsolutePath()+" counter: "+FileUtils.readFileToString(applogCountersFile, charset));
		//System.out.println(applogCountersFile.getAbsolutePath()+" length :"+logFile.length());
		
		return matchingLines.toString();
	}	
	
	public static void main(String[] args) throws Exception {
		
		Map<LogMonitorArguments,String> request = new HashMap<LogMonitorArguments,String>();
		request.put(LogMonitorArguments.id,"file-id");
		request.put(LogMonitorArguments.filePath,"test.log");
		request.put(LogMonitorArguments.inclusinRegex,"ERROR|Exception");
		request.put(LogMonitorArguments.exclusionRegex,"test");
		
		int counter=0;
		while (true) {
			String matchedLines = checkLogFile(request);
			System.out.println("----matchedLines---- "+counter++);
			System.out.println(matchedLines);
			Thread.sleep(10000);
		}
	}

}
