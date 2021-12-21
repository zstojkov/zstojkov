package com.zstojkov.javatest;

import java.io.File;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class FileList {

	public List<FileInfo> files;
	public FileList(String rootFolder) {
		files = new ArrayList<FileInfo>();
		File runFolder = new File(rootFolder);
		File[] taskFolders = runFolder.listFiles();
		for (File taskFolder : taskFolders) {
			String taskName = taskFolder.getName();
			if (!taskName.startsWith("processor_")) continue;
			File[] taskRunFolders = taskFolder.listFiles();
			if (taskRunFolders==null) continue;
			for (File taskRunFolder : taskRunFolders) {
				String timeStamp = taskRunFolder.getName();
				File[] runFiles = taskRunFolder.listFiles();
				if (runFiles==null) continue;
				if (Paths.get(taskRunFolder.getPath(),"ExitCode.FAILED").toFile().exists())
					if (!Paths.get(taskRunFolder.getPath(),"ExitCode.VERIFIED").toFile().exists()) continue;
				for (File runFile : runFiles) {
					String fileName = runFile.getName();
					if (fileName.endsWith("XRIC.xam") || fileName.endsWith("XRIC.xam.zip"))
						files.add(new FileInfo(runFile.toPath(),timeStamp,taskName));
				}
			}

		}
		files.sort(new Comparator<FileInfo>() {

			@Override
			public int compare(FileInfo o1, FileInfo o2) {
				return o1.timestamp.compareTo(o2.timestamp);
			}

		});

	}

	public List<FileInfo> getFiles() {
		return files;
	}
}
