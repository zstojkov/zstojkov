package com.zstojkov.javatest;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Date;
import java.util.Properties;

public class MailTest {
    public static void main(String[] args) {
    	MailTest.sendMail("zstojkov@magtia.com", "zstojkov@magtia.com",
            "Debug Demo", "Mail Debug Demo");
    }

    private static void sendMail(String mailFrom, String mailTo, String mailSubject,
                                 String mailText) {
        Properties props = new Properties() {{
            put("mail.smtp.auth", "true");
            put("mail.smtp.host", "smtp.gmail.com");
            put("mail.smtp.port", "587");
            put("mail.smtp.ssl.trust", "smtp.gmail.com");
            put("mail.debug", "true");
        }};
/*
				<entry key="mail.smtp.ssl.trust" value="smtp.gmail.com" />

 */
        // Creates a mail session. We need to supply username and
        // password for GMail authentication.
        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("zstojkov@magtia.com", "Yugo45ab-Magtia");
            }
        });

        try {
            // Creates email message
            Message message = new MimeMessage(session);
            message.setSentDate(new Date());
            message.setFrom(new InternetAddress(mailFrom));
            message.setRecipient(Message.RecipientType.TO,
                new InternetAddress(mailTo));
            message.setSubject(mailSubject);
            message.setText(mailText);

            // Send a message
            Transport.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}