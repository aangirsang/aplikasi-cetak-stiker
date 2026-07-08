package com.girsang.stiker.model.dto.request

import java.math.BigDecimal

data class PembelianRinciRequest(

    val dataBarangId: Long,
    val harga: BigDecimal = BigDecimal.ZERO,
    val jumlah: Long

)