package com.example.Sneakers.controllers;

import com.example.Sneakers.dtos.RoleDTO;
import com.example.Sneakers.dtos.UpdateUserDTO;
import com.example.Sneakers.dtos.UserDTO;
import com.example.Sneakers.dtos.UserLoginDTO;
import com.example.Sneakers.models.User;
import com.example.Sneakers.responses.UsersResponse;
import com.example.Sneakers.responses.LoginResponse;
import com.example.Sneakers.responses.RegisterResponse;
import com.example.Sneakers.responses.UserResponse;
import com.example.Sneakers.services.UserService;
import com.example.Sneakers.components.LocalizationUtils;
import com.example.Sneakers.utils.MessageKeys;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("${api.prefix}/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;
    private final LocalizationUtils localizationUtils;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> createUser(
            @Valid @RequestBody UserDTO userDTO,
            BindingResult result
    ){
        RegisterResponse registerResponse = new RegisterResponse();
        try {
            if(result.hasErrors()){
                List<String> errorMessages = result.getFieldErrors().stream()
                        .map(FieldError::getDefaultMessage).toList();
                registerResponse.setMessage(errorMessages.toString());
                return ResponseEntity.badRequest().body(registerResponse);
            }
            if(!userDTO.getPassword().equals(userDTO.getRetypePassword())){
                registerResponse.setMessage(localizationUtils.getLocalizedMessage(MessageKeys.PASSWORD_NOT_MATCH));
                return ResponseEntity.badRequest().body(registerResponse);
            }
            User user = userService.createUser(userDTO);
            registerResponse.setMessage(localizationUtils.getLocalizedMessage(MessageKeys.REGISTER_SUCCESSFULLY));
            registerResponse.setUser(user);
            return ResponseEntity.ok(registerResponse);
        } catch (Exception e) {
            registerResponse.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(registerResponse);
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?>login(
            @Valid @RequestBody UserLoginDTO userLoginDTO){
        try {
            String token = userService.login(
                    userLoginDTO.getPhoneNumber(),
                    userLoginDTO.getPassword());

            return ResponseEntity.ok(LoginResponse
                    .builder()
                    .message(localizationUtils.getLocalizedMessage(MessageKeys.LOGIN_SUCCESSFULLY))
                    .token(token)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    LoginResponse
                            .builder()
                            .message(localizationUtils.getLocalizedMessage(MessageKeys.LOGIN_FAILED,e.getMessage()))
                            .build());
        }
    }
    @GetMapping("/getAll")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllUsers(){
        try {
            List<UserResponse> users = userService.getAllUser();
            System.out.println(users.toString());
            return ResponseEntity.ok(users);
        }
        catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/find")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> find(@RequestParam("name") String name){
        try {
            List<UserResponse> users = userService.getAllUser();
            System.out.println(users.toString());
            return ResponseEntity.ok(users);
        }
        catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/details")
    public ResponseEntity<UserResponse> getUserDetails(@RequestHeader("Authorization") String token) {
        try {
            String extractedToken = token.substring(7); // Loại bỏ "Bearer " từ chuỗi token
            User user = userService.getUserDetailsFromToken(extractedToken);
            return ResponseEntity.ok(UserResponse.fromUser(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @PutMapping("/details/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<UserResponse> updateUserDetails(
            @PathVariable Long userId,
            @RequestBody UpdateUserDTO updatedUserDTO,
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        try {

            User updatedUser = userService.updateUser(userId, updatedUserDTO);
            return ResponseEntity.ok(UserResponse.fromUser(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/change-active/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<UserResponse> updateActive(
            @PathVariable Long userId,
            @RequestParam boolean activeUser,
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        try {
            System.out.println("active: " + activeUser);
            Optional<User> updatedUserOpt = userService.updateActiveUserById(userId, activeUser);

            return updatedUserOpt
                    .map(updatedUser -> ResponseEntity.ok(UserResponse.fromUser(updatedUser)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/changeRole/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> changeRoleUser(
            @PathVariable("userId") Long userId,
            @RequestBody RoleDTO roleDTO,
            @RequestHeader("Authorization") String token
    ){
        try {
            User user = userService.changeRoleUser(roleDTO.getRoleId(), userId);
            return ResponseEntity.ok(UsersResponse
                            .builder()
                            .users(userService.getAllUser())
                            .message("Update role successfully")
                            .build());
        }
        catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String token
    ){
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(UsersResponse.builder()
                            .users(userService.getAllUser())
                            .message("Delete user successfully")
                    .build());
        }
        catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}