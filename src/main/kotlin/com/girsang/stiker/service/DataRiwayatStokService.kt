package com.girsang.stiker.service

import com.girsang.stiker.config.JenisRiwayatStok
import com.girsang.stiker.model.entity.DataBarang
import com.girsang.stiker.model.entity.DataPengguna
import com.girsang.stiker.model.entity.DataRiwayatStok
import com.girsang.stiker.repository.DataRiwayatStokRepository
import org.springframework.stereotype.Service

@Service
class DataRiwayatStokService(
    private val repo: DataRiwayatStokRepository
) {

    fun simpan(
        barang: DataBarang,
        pengguna: DataPengguna,
        jenis: JenisRiwayatStok,
        referensiId: Long,
        perubahan: Long,
        saldo: Long,
        keterangan: String? = null
    ) {

        repo.save(
            DataRiwayatStok(
                dataBarang = barang,
                tanggal = System.currentTimeMillis(),
                jenis = jenis,
                referensiId = referensiId,
                perubahan = perubahan,
                saldoAwal = barang.stokBarang,
                saldoAkhir = saldo,
                dataPengguna = pengguna,
                keterangan = keterangan
            )
        )
    }

}