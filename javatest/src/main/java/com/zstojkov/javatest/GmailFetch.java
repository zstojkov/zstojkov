package com.zstojkov.javatest;


import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.search.*;

import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.*;

public class GmailFetch {

	public static void test() throws Exception {

		Session session = Session.getDefaultInstance(new Properties( ));
		Store store = session.getStore("imaps");
		store.connect("imap.googlemail.com", 993, "zstojkov@magtia.com", "Yugo45ab-Magtia");
		Folder inbox = store.getFolder( "INBOX" );
		inbox.open( Folder.READ_ONLY );


		Calendar cal = new GregorianCalendar();
		cal.add(Calendar.DAY_OF_MONTH, -7);
		Date sevenDaysAgo = cal.getTime();

		SearchTerm olderThan = new ReceivedDateTerm(ComparisonTerm.LT, new Date());
		SearchTerm newerThan = new ReceivedDateTerm(ComparisonTerm.GT, sevenDaysAgo);
		SearchTerm senderTerm = new FromTerm(new InternetAddress("mpuric@bloomberg.net"));
		SearchTerm andTerm = new AndTerm(olderThan, newerThan);
		andTerm = new AndTerm(andTerm, senderTerm);
		Message[] messages = inbox.search(andTerm);

		// Fetch unseen messages from inbox folder
		//    Message[] messages = inbox.search(
		//       new FlagTerm(new Flags(Flags.Flag.SEEN), false));

		// Sort messages from recent to oldest
		Arrays.sort( messages, ( m1, m2 ) -> {
			try {
				return m2.getSentDate().compareTo( m1.getSentDate() );
			} catch ( MessagingException e ) {
				throw new RuntimeException( e );
			}
		} );

		for ( Message message : messages ) {
			System.out.println(
					"sendDate: " + message.getSentDate()
					+ " subject:" + message.getSubject() );
		}
		if (messages.length>0) {
			Message message = messages[0];
			//Iterate multiparts
			Multipart multipart = (Multipart) message.getContent();
			for(int k = 0; k < multipart.getCount(); k++){
				BodyPart bodyPart = multipart.getBodyPart(k);

				System.out.println("getContentType: "+bodyPart.getContentType());
				System.out.println("getDescription: "+bodyPart.getDescription());
				System.out.println("getFileName: "+bodyPart.getFileName());
				System.out.println("getSize: "+bodyPart.getSize());

				String destFilePath = bodyPart.getFileName();

				if (destFilePath==null) continue;
				if (!destFilePath.endsWith("_1.xls")) continue;

				System.out.println("Saving file: "+destFilePath);
				FileOutputStream output = new FileOutputStream(destFilePath);

				InputStream stream =
						(InputStream) bodyPart.getInputStream();

				byte[] buffer = new byte[4096];

				int byteRead;

				while ((byteRead = stream.read(buffer)) != -1) {
				    output.write(buffer, 0, byteRead);
				}
				stream.close();
				output.close();
			}

		}
	}
}