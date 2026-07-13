package com.girsang.stiker.model.dto.request

data class PembelianRequest(

    val dataPenggunaId: String,
    val rincian: List<PembelianRinciRequest>

)