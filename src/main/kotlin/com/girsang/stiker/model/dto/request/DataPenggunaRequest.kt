package com.girsang.stiker.model.dto.request

data class DataPenggunaRequest (
    val namaLengkap: String,
    val namaPengguna: String,
    val kataSandi: String,
    val status: Boolean,
    val pathGambar: String,
    val dataLevelId: String
)