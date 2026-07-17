package com.girsang.stiker.model.dto.response

data class DataOrderanResponse(
    val id: String,
    val dataPenggunaId: String,
    val namaPengguna: String,
    val dataUmkmId: String,
    val namaUmkm: String,
    val tanggal: Long,
    val faktur: String,
    val totalStiker: Int,
    val rincian: List<DataOrderanRinciResponse>
)