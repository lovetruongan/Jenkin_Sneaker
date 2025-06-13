package com.example.Sneakers.services;

import com.example.Sneakers.dtos.UpdateUserDTO;
import com.example.Sneakers.dtos.UserDTO;
import com.example.Sneakers.models.User;
import com.example.Sneakers.responses.UserResponse;

import java.util.List;
import java.util.Optional;

public interface IUserService {
    User createUser(UserDTO userDTO) throws Exception;
    String login(String phoneNumber, String password, Long roleId) throws Exception;
    User getUserDetailsFromToken(String token) throws Exception;
    User updateUser(Long userId, UpdateUserDTO updatedUserDTO) throws Exception;
    Optional<User> updateActiveUserById(Long id, boolean activeUser);
    List<UserResponse> getAllUser();
    User changeRoleUser(Long roleId, Long userId) throws Exception;
    void deleteUser(Long id);
    void forgotPassword(String email) throws Exception;
    void resetPassword(String token, String newPassword) throws Exception;
    void changePassword(String token, String currentPassword, String newPassword) throws Exception;
}