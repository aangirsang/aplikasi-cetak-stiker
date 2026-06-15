package com.girsang.stiker.model.dto

import jakarta.validation.constraints.NotBlank

data class DataPenggunaUpdateRequest(

    @field:NotBlank(message = "Nama lengkap tidak boleh kosong")
    val namaLengkap: String,

    @field:NotBlank(message = "Nama pengguna tidak boleh kosong")
    val namaPengguna: String,

    val kataSandi: String?,

    val status: Boolean,

    val pathGambar: String,

    val dataLevel: DataLevelDto
)