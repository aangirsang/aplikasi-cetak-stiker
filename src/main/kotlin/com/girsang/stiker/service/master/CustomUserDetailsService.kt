package com.girsang.stiker.service.master

import com.girsang.stiker.repository.DataPenggunaRepository
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(
    private val repository: DataPenggunaRepository
) : UserDetailsService {

    override fun loadUserByUsername(
        username: String
    ): UserDetails {

        val pengguna =
            repository.findByNamaPengguna(username)
                ?: throw UsernameNotFoundException(username)

        return User.builder()
            .username(pengguna.namaPengguna)
            .password(pengguna.kataSandi)
            .roles(pengguna.dataLevel.level)
            .disabled(!pengguna.status)
            .build()
    }
}