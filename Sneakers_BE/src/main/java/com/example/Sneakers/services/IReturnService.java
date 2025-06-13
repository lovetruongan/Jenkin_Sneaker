package com.example.Sneakers.services;

import com.example.Sneakers.dtos.AdminReturnActionDTO;
import com.example.Sneakers.dtos.ReturnRequestDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.models.ReturnRequest;

import java.util.List;

public interface IReturnService {
    ReturnRequest createReturnRequest(ReturnRequestDTO returnRequestDTO, String token) throws Exception;

    List<ReturnRequest> getMyReturnRequests(String token) throws Exception;

    List<ReturnRequest> getAllReturnRequestsForAdmin();

    ReturnRequest approveReturnRequest(Long requestId, AdminReturnActionDTO actionDTO) throws Exception;

    ReturnRequest rejectReturnRequest(Long requestId, AdminReturnActionDTO actionDTO) throws DataNotFoundException;

    ReturnRequest completeRefund(Long requestId, AdminReturnActionDTO actionDTO) throws Exception;
} 