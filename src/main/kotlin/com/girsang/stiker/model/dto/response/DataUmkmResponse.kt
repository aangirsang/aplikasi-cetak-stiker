package com.girsang.stiker.model.dto.response

data class DataUmkmResponse(
    val id: String,
    var namaUsaha: String,
    var namaPemilik: String,
    var kategoriId: String,
    var kategori: String,
    var deskripsi: String? = "-",
    var noKtp: String,
    var jenisKelamin: Boolean,
    var tglLahir: Long,
    var noTelpon: String? = "-",
    var email: String,
    var alamat: String? = "-",
    var whatsapp: String? = "-",
    var instagram: String? = "-",
    var facebook: String? = "-",
    var tiktok: String? = "-",
    var status: Boolean,
    var tglRegistrasi: Long
)