package com.girsang.stiker.service

import com.girsang.stiker.model.dto.DataPenggunaCreateRequest
import com.girsang.stiker.model.dto.DataPenggunaUpdateRequest
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

    fun simpan(request: DataPenggunaCreateRequest): DataPengguna {
        if (repo.existsByNamaPengguna(request.namaPengguna)) {
            throw IllegalArgumentException("Nama pengguna sudah digunakan")
        }

        val level =
            dataLevelRepo.findById(
                request.dataLevel.id
            ).orElseThrow()

        val pengguna =
            DataPengguna(
                namaLengkap = request.namaLengkap,
                namaPengguna = request.namaPengguna,
                kataSandi = request.kataSandi,
                status = request.status,
                pathGambar = request.pathGambar,
                dataLevel = level
            )

        return repo.save(pengguna)
    }
    fun update(id: Long, request: DataPenggunaUpdateRequest): DataPengguna {

        val dataLama = repo.findById(id).orElseThrow {
            NoSuchElementException(
                "Data pengguna dengan id $id tidak ditemukan"
            )
        }

        // cek username duplicate
        val usernameDipakai =
            repo.existsByNamaPenggunaAndIdNot(
                request.namaPengguna,
                id
            )

        if (usernameDipakai) {
            throw IllegalArgumentException(
                "Nama pengguna sudah digunakan"
            )
        }

        dataLama.namaLengkap =
            request.namaLengkap

        dataLama.namaPengguna =
            request.namaPengguna

        dataLama.status =
            request.status

        dataLama.pathGambar =
            request.pathGambar

        val level =
            dataLevelRepo.findById(
                request.dataLevel.id
            ).orElseThrow()

        dataLama.dataLevel = level

        // hanya update password jika diisi
        if(!request.kataSandi.isNullOrBlank()){
            dataLama.kataSandi =
                request.kataSandi
        }

        return repo.save(dataLama)
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