package com.girsang.stiker.model.dto.response

import com.girsang.stiker.model.entity.DataLevel

data class DataPenggunaResponse(
    val id: String,
    var namaLengkap: String,
    var namaPengguna: String,
    var dataLevel: DataLevel,
    var status: Boolean,
    var pathGambar: String
)