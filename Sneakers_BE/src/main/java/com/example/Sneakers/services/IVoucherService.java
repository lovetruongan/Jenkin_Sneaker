package com.example.Sneakers.services;

import com.example.Sneakers.dtos.ApplyVoucherDTO;
import com.example.Sneakers.dtos.VoucherDTO;
import com.example.Sneakers.models.Voucher;
import com.example.Sneakers.responses.VoucherApplicationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface IVoucherService {
    Voucher createVoucher(VoucherDTO voucherDTO) throws Exception;

    Voucher getVoucherById(Long id) throws Exception;

    Voucher getVoucherByCode(String code) throws Exception;

    Page<Voucher> getAllVouchers(PageRequest pageRequest);

    Page<Voucher> getActiveVouchers(PageRequest pageRequest);

    Page<Voucher> getValidVouchers(PageRequest pageRequest);

    Page<Voucher> searchVouchers(String keyword, PageRequest pageRequest);

    Voucher updateVoucher(Long id, VoucherDTO voucherDTO) throws Exception;

    void deleteVoucher(Long id) throws Exception;

    VoucherApplicationResponse applyVoucher(ApplyVoucherDTO applyVoucherDTO) throws Exception;

    boolean isVoucherUsedInOrders(Long voucherId);

    void useVoucher(Long voucherId, Long orderId, Long userId, Long discountAmount) throws Exception;
}