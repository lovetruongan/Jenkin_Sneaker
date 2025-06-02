package com.example.Sneakers.controllers;

import com.example.Sneakers.components.LocalizationUtils;
import com.example.Sneakers.dtos.ApplyVoucherDTO;
import com.example.Sneakers.dtos.VoucherDTO;
import com.example.Sneakers.models.Voucher;
import com.example.Sneakers.responses.*;
import com.example.Sneakers.services.IVoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/vouchers")
@RequiredArgsConstructor
public class VoucherController {
    private final IVoucherService voucherService;
    private final LocalizationUtils localizationUtils;

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createVoucher(
            @Valid @RequestBody VoucherDTO voucherDTO,
            BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }

            // Check for missing required fields
            if (voucherDTO.getCode() == null || voucherDTO.getCode().isEmpty() ||
                    voucherDTO.getName() == null || voucherDTO.getName().isEmpty() ||
                    voucherDTO.getDiscountPercentage() == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin cần thiết");
            }

            Voucher voucher = voucherService.createVoucher(voucherDTO);
            return ResponseEntity.ok(VoucherResponse.fromVoucher(voucher));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getAllVouchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "active", required = false) String filter) {
        try {
            PageRequest pageRequest = PageRequest.of(
                    page, limit,
                    Sort.by("createdAt").descending());

            Page<Voucher> voucherPage;
            switch (filter) {
                case "active":
                    voucherPage = voucherService.getActiveVouchers(pageRequest);
                    break;
                case "valid":
                    voucherPage = voucherService.getValidVouchers(pageRequest);
                    break;
                default:
                    voucherPage = voucherService.getAllVouchers(pageRequest);
            }

            // Check if no vouchers exist
            if (voucherPage.getTotalElements() == 0) {
                return ResponseEntity.ok(MessageResponse.builder()
                        .message("Không có voucher")
                        .build());
            }

            Page<VoucherResponse> voucherResponsePage = voucherPage.map(VoucherResponse::fromVoucher);
            int totalPages = voucherResponsePage.getTotalPages();
            List<VoucherResponse> voucherResponses = voucherResponsePage.getContent();

            return ResponseEntity.ok(VoucherListResponse.builder()
                    .vouchers(voucherResponses)
                    .totalPages(totalPages)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVoucherById(@PathVariable Long id) {
        try {
            Voucher voucher = voucherService.getVoucherById(id);
            return ResponseEntity.ok(VoucherResponse.fromVoucher(voucher));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<?> getVoucherByCode(@PathVariable String code) {
        try {
            Voucher voucher = voucherService.getVoucherByCode(code);
            return ResponseEntity.ok(VoucherResponse.fromVoucher(voucher));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchVouchers(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            PageRequest pageRequest = PageRequest.of(
                    page, limit,
                    Sort.by("createdAt").descending());

            Page<Voucher> voucherPage = voucherService.searchVouchers(keyword, pageRequest);
            Page<VoucherResponse> voucherResponsePage = voucherPage.map(VoucherResponse::fromVoucher);

            int totalPages = voucherResponsePage.getTotalPages();
            List<VoucherResponse> voucherResponses = voucherResponsePage.getContent();

            return ResponseEntity.ok(VoucherListResponse.builder()
                    .vouchers(voucherResponses)
                    .totalPages(totalPages)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherDTO voucherDTO,
            BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }

            Voucher voucher = voucherService.updateVoucher(id, voucherDTO);
            return ResponseEntity.ok(VoucherResponse.fromVoucher(voucher));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        try {
            // Check if voucher is being used in orders
            if (voucherService.isVoucherUsedInOrders(id)) {
                return ResponseEntity.badRequest()
                        .body("Không thể xóa voucher đang được sử dụng trong đơn hàng");
            }

            voucherService.deleteVoucher(id);
            return ResponseEntity.ok(MessageResponse.builder()
                    .message("Xóa voucher thành công")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyVoucher(
            @Valid @RequestBody ApplyVoucherDTO applyVoucherDTO,
            BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }

            VoucherApplicationResponse response = voucherService.applyVoucher(applyVoucherDTO);

            if (!response.getIsApplied()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}