package com.example.Sneakers.services;

import com.example.Sneakers.dtos.UpdateUserDTO;
import com.example.Sneakers.dtos.UserDTO;
import com.example.Sneakers.models.User;
import com.example.Sneakers.responses.UserResponse;

import java.util.List;

public interface IUserService {
    User createUser(UserDTO userDTO) throws Exception;
    String login(String phoneNumber, String password) throws Exception;
    User getUserDetailsFromToken(String token) throws Exception;
    User updateUser(Long userId, UpdateUserDTO updatedUserDTO) throws Exception;
    List<UserResponse> getAllUser();
    User changeRoleUser(Long roleId, Long userId) throws Exception;
    void deleteUser(Long id);
}