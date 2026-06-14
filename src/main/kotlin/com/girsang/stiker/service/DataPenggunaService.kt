package com.girsang.stiker.service

import com.girsang.stiker.model.entity.DataPengguna
import com.girsang.stiker.repository.DataLevelRepository
import com.girsang.stiker.repository.DataPenggunaRepository
import org.springframework.stereotype.Service
import java.util.Optional


@Service
class DataPenggunaService(
    private val repo: DataPenggunaRepository,
    private val dataLevelRepo: DataLevelRepository
) {

    fun semuaPengguna(): List<DataPengguna> = repo.findAll()
    fun cariID(id: Long): Optional<DataPengguna> = repo.findById(id)

    fun simpan(dataPengguna: DataPengguna): DataPengguna {
        if (repo.existsByNamaPengguna(dataPengguna.namaPengguna)) {
            throw IllegalArgumentException("Nama pengguna sudah digunakan")
        }
        return repo.save(dataPengguna)
    }
    fun update(
        id: Long,
        dataPengguna: DataPengguna
    ): DataPengguna {

        val dataLama =
            repo.findById(id)
                .orElseThrow {
                    NoSuchElementException(
                        "Data pengguna dengan id $id tidak ditemukan"
                    )
                }

        // cek username duplicate
        val usernameDipakai =
            repo.existsByNamaPenggunaAndIdNot(
                dataPengguna.namaPengguna,
                id
            )

        if (usernameDipakai) {
            throw IllegalArgumentException(
                "Nama pengguna sudah digunakan"
            )
        }

        dataLama.namaLengkap =
            dataPengguna.namaLengkap

        dataLama.namaPengguna =
            dataPengguna.namaPengguna

        dataLama.status =
            dataPengguna.status

        dataLama.pathGambar =
            dataPengguna.pathGambar

        // level
        dataPengguna.dataLevel.id.let {

            val level =
                dataLevelRepo
                    .findById(it)
                    .orElseThrow {
                        NoSuchElementException(
                            "Level tidak ditemukan"
                        )
                    }

            dataLama.dataLevel =
                level
        }

        // password optional
        if (
            !dataPengguna.kataSandi
                .isNullOrBlank()
        ) {
            dataLama.kataSandi =

                    dataPengguna.kataSandi

        }

        return repo.save(
            dataLama
        )
    }
    fun hapus(id: Long){
        if(repo.existsById(id)){
            repo.deleteById(id)
        }else {
            throw NoSuchElementException("Data Pengguna dengan id $id tidak ditemukan")
        }
    }
    // 🔐 Fungsi Login
    fun login(namaPengguna: String, kataSandi: String): DataPengguna? {
        val pengguna = repo.findByNamaPengguna(namaPengguna)

        // Jika username tidak ditemukan
        if (pengguna == null) {
            return null
        }

        // Jika password tidak cocok
        if (pengguna.kataSandi != kataSandi) {
            return null
        }

        return pengguna
    }
    fun count(): Long {
        return repo.count()
    }
}