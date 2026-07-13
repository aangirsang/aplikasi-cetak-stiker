package com.girsang.stiker.model.dto.request

import jakarta.validation.constraints.Email

data class DataUmkmRequest(
    var namaUsaha: String,
    var namaPemilik: String,
    var dataKategoriId: String,
    var deskripsi: String? = "-",
    var noKtp: String,
    var jenisKelamin: Boolean = true,
    var tglLahir: Long = 0,
    var noTelpon: String,

    @field:Email(message = "Format email tidak valid")
    var email: String,

    var alamat: String,
    var whatsapp: String? = "-",
    var instagram: String? = "-",
    var facebook: String? = "-",
    var tiktok: String? = "-",
    var status: Boolean = true,
    var tglRegistrasi: Long
)