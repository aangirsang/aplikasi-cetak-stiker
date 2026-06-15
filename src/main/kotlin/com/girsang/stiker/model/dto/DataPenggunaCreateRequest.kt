package com.girsang.stiker.model.dto

import jakarta.validation.constraints.NotBlank

data class DataPenggunaCreateRequest(

    @field:NotBlank(message = "Nama lengkap tidak boleh kosong")
    val namaLengkap: String,

    @field:NotBlank(message = "Nama pengguna tidak boleh kosong")
    val namaPengguna: String,

    @field:NotBlank(message = "Kata sandi tidak boleh kosong")
    val kataSandi: String,

    val status: Boolean,

    val pathGambar: String,

    val dataLevel: DataLevelDto
)