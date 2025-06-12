package com.example.Sneakers.vnpay.service;

import com.example.Sneakers.vnpay.config.VNPayConfig;
import com.example.Sneakers.vnpay.dto.*;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.models.Payment;
import com.example.Sneakers.repositories.OrderRepository;
import com.example.Sneakers.repositories.PaymentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VNPayService {

    private final VNPayConfig vnPayConfig;
    private final ObjectMapper objectMapper;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentResponse createPayment(PaymentCreateDTO paymentDTO, HttpServletRequest request) {
        try {
            // Validate order exists
            Order order = orderRepository.findById(paymentDTO.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Check if payment already exists for this order
            if (paymentRepository.findByOrderId(order.getId()).isPresent()) {
                return new PaymentResponse("02", "Payment already exists for this order", null);
            }

            String vnp_Version = vnPayConfig.getVnpVersion();
            String vnp_Command = "pay";
            String orderType = "other";
            long amount = paymentDTO.getAmount() * 100;
            String bankCode = paymentDTO.getBankCode();

            String vnp_TxnRef = VNPayConfig.getRandomNumber(8);
            String vnp_IpAddr = VNPayConfig.getIpAddress(request);
            String vnp_TmnCode = vnPayConfig.getVnpTmnCode();

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");

            if (bankCode != null && !bankCode.isEmpty()) {
                vnp_Params.put("vnp_BankCode", bankCode);
            }
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", paymentDTO.getOrderInfo() != null ? paymentDTO.getOrderInfo()
                    : "Thanh toan don hang:" + vnp_TxnRef);
            vnp_Params.put("vnp_OrderType", orderType);

            String locate = paymentDTO.getLanguage();
            if (locate != null && !locate.isEmpty()) {
                vnp_Params.put("vnp_Locale", locate);
            } else {
                vnp_Params.put("vnp_Locale", "vn");
            }
            vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());

            // Fix IPv6 address issue - convert ::1 to 127.0.0.1
            if ("0:0:0:0:0:0:0:1".equals(vnp_IpAddr) || "::1".equals(vnp_IpAddr)) {
                vnp_IpAddr = "127.0.0.1";
            }
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            String queryUrl = query.toString();
            String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());

            if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
                log.error("Failed to generate secure hash for payment");
                return new PaymentResponse("99", "Failed to generate secure hash", null);
            }

            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = vnPayConfig.getVnpPayUrl() + "?" + queryUrl;

            // Save payment record
            Payment payment = Payment.builder()
                    .order(order)
                    .vnpTxnRef(vnp_TxnRef)
                    .vnpOrderInfo(vnp_Params.get("vnp_OrderInfo"))
                    .vnpAmount(amount)
                    .paymentStatus(Payment.PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);

            return new PaymentResponse("00", "success", paymentUrl);

        } catch (Exception e) {
            log.error("Error creating payment: ", e);
            return new PaymentResponse("99", "Error: " + e.getMessage(), null);
        }
    }

    public String queryTransaction(PaymentQueryDTO queryDTO, HttpServletRequest request) {
        try {
            String vnp_RequestId = VNPayConfig.getRandomNumber(8);
            String vnp_Version = vnPayConfig.getVnpVersion();
            String vnp_Command = "querydr";
            String vnp_TmnCode = vnPayConfig.getVnpTmnCode();
            String vnp_TxnRef = queryDTO.getTxnRef();
            String vnp_OrderInfo = "Kiem tra ket qua GD OrderId:" + vnp_TxnRef;
            String vnp_TransDate = queryDTO.getTransDate();

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());

            String vnp_IpAddr = VNPayConfig.getIpAddress(request);

            JsonObject vnp_Params = new JsonObject();
            vnp_Params.addProperty("vnp_RequestId", vnp_RequestId);
            vnp_Params.addProperty("vnp_Version", vnp_Version);
            vnp_Params.addProperty("vnp_Command", vnp_Command);
            vnp_Params.addProperty("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.addProperty("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.addProperty("vnp_OrderInfo", vnp_OrderInfo);
            vnp_Params.addProperty("vnp_TransactionDate", vnp_TransDate);
            vnp_Params.addProperty("vnp_CreateDate", vnp_CreateDate);
            vnp_Params.addProperty("vnp_IpAddr", vnp_IpAddr);

            String hash_Data = String.join("|", vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode,
                    vnp_TxnRef, vnp_TransDate, vnp_CreateDate, vnp_IpAddr, vnp_OrderInfo);
            String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hash_Data);

            vnp_Params.addProperty("vnp_SecureHash", vnp_SecureHash);

            URL url = new URL(vnPayConfig.getVnpApiUrl());
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setDoOutput(true);

            DataOutputStream wr = new DataOutputStream(con.getOutputStream());
            wr.writeBytes(vnp_Params.toString());
            wr.flush();
            wr.close();

            int responseCode = con.getResponseCode();
            log.info("Query transaction response code: {}", responseCode);

            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String output;
            StringBuilder response = new StringBuilder();
            while ((output = in.readLine()) != null) {
                response.append(output);
            }
            in.close();

            return response.toString();

        } catch (Exception e) {
            log.error("Error querying transaction: ", e);
            return "{\"code\":\"99\",\"message\":\"Error: " + e.getMessage() + "\"}";
        }
    }

    public String refundTransaction(PaymentRefundDTO refundDTO, HttpServletRequest request) {
        try {
            String vnp_RequestId = VNPayConfig.getRandomNumber(8);
            String vnp_Version = vnPayConfig.getVnpVersion();
            String vnp_Command = "refund";
            String vnp_TmnCode = vnPayConfig.getVnpTmnCode();
            String vnp_TransactionType = refundDTO.getTransactionType();
            String vnp_TxnRef = refundDTO.getTxnRef();
            long amount = refundDTO.getAmount() * 100;
            String vnp_Amount = String.valueOf(amount);
            String vnp_OrderInfo = "Hoan tien GD OrderId:" + vnp_TxnRef;
            String vnp_TransactionNo = refundDTO.getTransactionNo() != null ? refundDTO.getTransactionNo() : "";
            String vnp_TransactionDate = refundDTO.getTransDate();
            String vnp_CreateBy = refundDTO.getUser();

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());

            String vnp_IpAddr = VNPayConfig.getIpAddress(request);

            JsonObject vnp_Params = new JsonObject();
            vnp_Params.addProperty("vnp_RequestId", vnp_RequestId);
            vnp_Params.addProperty("vnp_Version", vnp_Version);
            vnp_Params.addProperty("vnp_Command", vnp_Command);
            vnp_Params.addProperty("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.addProperty("vnp_TransactionType", vnp_TransactionType);
            vnp_Params.addProperty("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.addProperty("vnp_Amount", vnp_Amount);
            vnp_Params.addProperty("vnp_OrderInfo", vnp_OrderInfo);

            if (vnp_TransactionNo != null && !vnp_TransactionNo.isEmpty()) {
                vnp_Params.addProperty("vnp_TransactionNo", vnp_TransactionNo);
            }

            vnp_Params.addProperty("vnp_TransactionDate", vnp_TransactionDate);
            vnp_Params.addProperty("vnp_CreateBy", vnp_CreateBy);
            vnp_Params.addProperty("vnp_CreateDate", vnp_CreateDate);
            vnp_Params.addProperty("vnp_IpAddr", vnp_IpAddr);

            String hash_Data = String.join("|", vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode,
                    vnp_TransactionType, vnp_TxnRef, vnp_Amount, vnp_TransactionNo, vnp_TransactionDate,
                    vnp_CreateBy, vnp_CreateDate, vnp_IpAddr, vnp_OrderInfo);

            String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hash_Data);

            vnp_Params.addProperty("vnp_SecureHash", vnp_SecureHash);

            URL url = new URL(vnPayConfig.getVnpApiUrl());
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setDoOutput(true);

            DataOutputStream wr = new DataOutputStream(con.getOutputStream());
            wr.writeBytes(vnp_Params.toString());
            wr.flush();
            wr.close();

            int responseCode = con.getResponseCode();
            log.info("Refund transaction response code: {}", responseCode);

            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String output;
            StringBuilder response = new StringBuilder();
            while ((output = in.readLine()) != null) {
                response.append(output);
            }
            in.close();

            return response.toString();

        } catch (Exception e) {
            log.error("Error refunding transaction: ", e);
            return "{\"code\":\"99\",\"message\":\"Error: " + e.getMessage() + "\"}";
        }
    }

    public Map<String, String> handleReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");

        if (fields.containsKey("vnp_SecureHashType")) {
            fields.remove("vnp_SecureHashType");
        }
        if (fields.containsKey("vnp_SecureHash")) {
            fields.remove("vnp_SecureHash");
        }

        String signValue = vnPayConfig.hashAllFields(fields);

        // Log validation result for monitoring
        log.info("VNPay return validation - TxnRef: {}, Valid: {}",
                fields.get("vnp_TxnRef"), signValue.equals(vnp_SecureHash));

        Map<String, String> result = new HashMap<>();
        result.put("isValid", signValue.equals(vnp_SecureHash) ? "true" : "false");
        result.put("vnp_ResponseCode", fields.get("vnp_ResponseCode"));
        result.put("vnp_TxnRef", fields.get("vnp_TxnRef"));
        result.put("vnp_Amount", fields.get("vnp_Amount"));
        result.put("vnp_BankCode", fields.get("vnp_BankCode"));
        result.put("vnp_PayDate", fields.get("vnp_PayDate"));

        // Update payment status if signature is valid
        if (signValue.equals(vnp_SecureHash)) {
            String vnpTxnRef = fields.get("vnp_TxnRef");
            String responseCode = fields.get("vnp_ResponseCode");

            paymentRepository.findByVnpTxnRef(vnpTxnRef).ifPresent(payment -> {
                payment.setVnpResponseCode(responseCode);
                payment.setVnpTransactionNo(fields.get("vnp_TransactionNo"));
                payment.setVnpBankCode(fields.get("vnp_BankCode"));
                payment.setVnpBankTranNo(fields.get("vnp_BankTranNo"));
                payment.setVnpCardType(fields.get("vnp_CardType"));
                payment.setVnpPayDate(fields.get("vnp_PayDate"));
                payment.setVnpTransactionStatus(fields.get("vnp_TransactionStatus"));

                if ("00".equals(responseCode)) {
                    payment.setPaymentStatus(Payment.PaymentStatus.SUCCESS);
                    payment.setPaymentDate(java.time.LocalDateTime.now());

                    // Update order status
                    Order order = payment.getOrder();
                    order.setStatus("PAID");
                    orderRepository.save(order);
                } else {
                    payment.setPaymentStatus(Payment.PaymentStatus.FAILED);
                }

                paymentRepository.save(payment);
            });
        }

        return result;
    }
}