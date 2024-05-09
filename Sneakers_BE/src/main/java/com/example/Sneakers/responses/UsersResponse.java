package com.example.Sneakers.responses;

import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsersResponse {
    private List<UserResponse> users;

    private String message;
}