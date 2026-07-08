package com.girsang.stiker.model.dto.request

data class PembelianRequest(

    val dataPenggunaId: Long,
    val rincian: List<PembelianRinciRequest>

)