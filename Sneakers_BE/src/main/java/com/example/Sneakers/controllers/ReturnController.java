package com.example.Sneakers.controllers;

import com.example.Sneakers.dtos.AdminReturnActionDTO;
import com.example.Sneakers.dtos.ReturnRequestDTO;
import com.example.Sneakers.dtos.ReturnRequestResponseDTO;
import com.example.Sneakers.models.ReturnRequest;
import com.example.Sneakers.responses.MessageResponse;
import com.example.Sneakers.services.IReturnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/returns")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReturnController {

    private final IReturnService returnService;

    @PostMapping("")
    public ResponseEntity<?> createReturnRequest(
            @Valid @RequestBody ReturnRequestDTO returnRequestDTO,
            @RequestHeader(value = "Authorization", required = false) String token,
            BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }
            ReturnRequest newReturnRequest = returnService.createReturnRequest(returnRequestDTO, token);
            return ResponseEntity.status(HttpStatus.CREATED).body(ReturnRequestResponseDTO.fromReturnRequest(newReturnRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyReturnRequests(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            List<ReturnRequest> returnRequests = returnService.getMyReturnRequests(token);
            List<ReturnRequestResponseDTO> response = returnRequests.stream()
                    .map(ReturnRequestResponseDTO::fromReturnRequest)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/admin/all")
    // @PreAuthorize("hasRole('ROLE_ADMIN')") // TODO: Enable this for production
    public ResponseEntity<?> getAllReturnRequestsForAdmin() {
        List<ReturnRequest> returnRequests = returnService.getAllReturnRequestsForAdmin();
        List<ReturnRequestResponseDTO> response = returnRequests.stream()
                .map(ReturnRequestResponseDTO::fromReturnRequest)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/{id}/approve")
    // @PreAuthorize("hasRole('ROLE_ADMIN')") // TODO: Enable this for production
    public ResponseEntity<?> approveReturnRequest(
            @PathVariable Long id,
            @Valid @RequestBody AdminReturnActionDTO actionDTO,
            BindingResult result) {
        try {
            if (result.hasErrors()) {
                return ResponseEntity.badRequest().body(result.getFieldErrors().stream().map(FieldError::getDefaultMessage).toList());
            }
            ReturnRequest updatedRequest = returnService.approveReturnRequest(id, actionDTO);
            return ResponseEntity.ok(ReturnRequestResponseDTO.fromReturnRequest(updatedRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/admin/{id}/reject")
    // @PreAuthorize("hasRole('ROLE_ADMIN')") // TODO: Enable this for production
    public ResponseEntity<?> rejectReturnRequest(
            @PathVariable Long id,
            @Valid @RequestBody AdminReturnActionDTO actionDTO,
            BindingResult result) {
        try {
            if (result.hasErrors()) {
                return ResponseEntity.badRequest().body(result.getFieldErrors().stream().map(FieldError::getDefaultMessage).toList());
            }
            ReturnRequest updatedRequest = returnService.rejectReturnRequest(id, actionDTO);
            return ResponseEntity.ok(ReturnRequestResponseDTO.fromReturnRequest(updatedRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/admin/{id}/complete-refund")
    // @PreAuthorize("hasRole('ROLE_ADMIN')") // TODO: Enable this for production
    public ResponseEntity<?> completeRefund(
            @PathVariable Long id,
            @Valid @RequestBody AdminReturnActionDTO actionDTO,
            BindingResult result) {
        try {
            if (result.hasErrors()) {
                return ResponseEntity.badRequest().body(result.getFieldErrors().stream().map(FieldError::getDefaultMessage).toList());
            }
            ReturnRequest updatedRequest = returnService.completeRefund(id, actionDTO);
            return ResponseEntity.ok(ReturnRequestResponseDTO.fromReturnRequest(updatedRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
} 