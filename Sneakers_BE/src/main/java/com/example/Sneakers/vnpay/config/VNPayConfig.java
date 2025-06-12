package com.example.Sneakers.vnpay.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Configuration
public class VNPayConfig {

    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpPayUrl;

    @Value("${vnpay.return-url:http://localhost:8080/api/v1/payments/vnpay-return}")
    private String vnpReturnUrl;

    @Value("${vnpay.tmn-code:}")
    private String vnpTmnCode;

    @Value("${vnpay.secret-key:}")
    private String secretKey;

    @Value("${vnpay.api-url:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String vnpApiUrl;

    @Value("${vnpay.version:2.1.0}")
    private String vnpVersion;

    public String getVnpPayUrl() {
        return vnpPayUrl;
    }

    public String getVnpReturnUrl() {
        return vnpReturnUrl;
    }

    public String getVnpTmnCode() {
        return vnpTmnCode;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getVnpApiUrl() {
        return vnpApiUrl;
    }

    public String getVnpVersion() {
        return vnpVersion;
    }

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    public static String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public String hashAllFields(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        boolean first = true;

        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                if (!first) {
                    sb.append("&");
                }
                sb.append(fieldName);
                sb.append("=");
                sb.append(fieldValue);
                first = false;
            }
        }

        String hashData = sb.toString();
        return hmacSHA512(secretKey, hashData);
    }
}