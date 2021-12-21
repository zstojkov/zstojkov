package com.zstojkov.javatest;

import java.nio.file.Path;

public class FileInfo {
		public Path path;
		public String timestamp;
		public String task;
		public FileInfo(Path path,String timestamp,String task) {
			this.path=path;
			this.task=task;
			this.timestamp=timestamp;
		}
		@Override
		public String toString() {
			return task+"-"+timestamp+"-"+path;
		}
	}
