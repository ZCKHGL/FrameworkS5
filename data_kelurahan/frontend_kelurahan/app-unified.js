// app.js - Unified JavaScript untuk semua halaman frontend

// ============================================
// UTILITY FUNCTIONS (dipakai di semua halaman)
// ============================================

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function getUsername() {
    return localStorage.getItem('username');
}

function setAuthToken(token, username) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
}

function clearAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
}

function showMessage(messageDiv, message, isError = false) {
    if (!messageDiv) return;
    messageDiv.textContent = message;
    messageDiv.className = isError ? 'error' : 'success';
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// ============================================
// DETECT CURRENT PAGE
// ============================================

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (filename.includes('login')) return 'login';
    if (filename.includes('set-token')) return 'set-token';
    if (filename.includes('test-login')) return 'test-login';
    if (filename.includes('pengaduan')) return 'pengaduan';
    if (filename.includes('index') || filename === '') return 'index';
    
    return 'unknown';
}

// ============================================
// LOGIN PAGE LOGIC
// ============================================

function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('message');
    const apiUrl = 'http://127.0.0.1:8000/api/auth/token/';

    // Cek apakah user sudah login
    const token = getAuthToken();
    if (token) {
        window.location.href = 'index.html';
        return;
    }

    if (!loginForm) return;

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            setAuthToken(data.token, username);
            showMessage(messageDiv, 'Login berhasil! Mengalihkan...', false);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage(messageDiv, 'Login gagal. Periksa username dan password Anda.', true);
        });
    });
}

// ============================================
// SET TOKEN PAGE LOGIC
// ============================================

function initSetTokenPage() {
    const tokenForm = document.getElementById('token-form');
    if (!tokenForm) return;

    // Display current token on load
    updateCurrentTokenDisplay();

    tokenForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const token = document.getElementById('token').value.trim();
        
        if (!username || !token) {
            alert('Username dan token harus diisi!');
            return;
        }
        
        setAuthToken(token, username);
        
        const successDiv = document.getElementById('success-message');
        if (successDiv) {
            successDiv.style.display = 'block';
            successDiv.innerHTML = `
                <strong>✅ Token berhasil disimpan!</strong><br>
                Username: ${username}<br>
                Token: ${token}<br><br>
                Mengalihkan ke halaman utama dalam 2 detik...
            `;
        }
        
        updateCurrentTokenDisplay();
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    });
}

function updateCurrentTokenDisplay() {
    const tokenDisplay = document.getElementById('token-display');
    const usernameDisplay = document.getElementById('username-display');
    
    if (tokenDisplay && usernameDisplay) {
        const token = getAuthToken();
        const username = getUsername();
        
        tokenDisplay.textContent = token || 'Tidak ada';
        usernameDisplay.textContent = username || 'Tidak ada';
    }
}

function clearToken() {
    if (confirm('Yakin ingin menghapus token?')) {
        clearAuthToken();
        alert('Token berhasil dihapus!');
        updateCurrentTokenDisplay();
        
        const usernameInput = document.getElementById('username');
        const tokenInput = document.getElementById('token');
        if (usernameInput) usernameInput.value = '';
        if (tokenInput) tokenInput.value = '';
    }
}

// ============================================
// INDEX PAGE LOGIC (Main Application)
// ============================================

// Global pagination variables
let currentPage = 1;
let totalPages = 1;
let totalCount = 0;

function initIndexPage() {
    const wargaListContainer = document.getElementById('warga-list-container');
    const formWarga = document.getElementById('form-warga');
    const messageDiv = document.getElementById('message');
    const userInfoDiv = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const formToggle = document.getElementById('form-toggle');
    const formContent = document.getElementById('form-content');
    const apiUrl = 'http://127.0.0.1:8000/api/warga/';

    if (!wargaListContainer) return;

    const authToken = getAuthToken();
    const username = getUsername();

    // Toggle form collapse/expand
    if (formToggle && formContent) {
        formToggle.addEventListener('click', () => {
            formContent.classList.toggle('show');
            const icon = formToggle.querySelector('.toggle-icon');
            icon.classList.toggle('collapsed');
        });
    }

    // Tampilkan user info jika sudah login
    if (authToken && username && userInfoDiv) {
        userInfoDiv.style.display = 'flex';
        if (usernameDisplay) usernameDisplay.textContent = username;

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Yakin ingin logout?')) {
                    clearAuthToken();
                    showMessage(messageDiv, 'Logout berhasil! Redirecting...', false);
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                }
            });
        }
    }

    // Fungsi untuk render data warga
    function renderWarga(warga) {
        const wargaDiv = document.createElement('div');
        wargaDiv.className = 'warga-item';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'warga-content';

        const nama = document.createElement('h3');
        nama.textContent = warga.nama_lengkap;

        const nik = document.createElement('p');
        nik.textContent = `📋 NIK: ${warga.nik}`;

        const alamat = document.createElement('p');
        alamat.textContent = `📍 Alamat: ${warga.alamat}`;

        contentDiv.appendChild(nama);
        contentDiv.appendChild(nik);
        contentDiv.appendChild(alamat);

        if (warga.no_telepon) {
            const telepon = document.createElement('p');
            telepon.textContent = `📞 Telepon: ${warga.no_telepon}`;
            contentDiv.appendChild(telepon);
        }

        // Tombol aksi (Edit & Delete)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'warga-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = '✏️ Edit';
        editBtn.onclick = () => editWarga(warga);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.onclick = () => deleteWarga(warga.id, warga.nama_lengkap);

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        wargaDiv.appendChild(contentDiv);
        wargaDiv.appendChild(actionsDiv);

        return wargaDiv;
    }

    // Fungsi untuk edit warga
    function editWarga(warga) {
        // Tampilkan form jika tersembunyi
        if (formContent) {
            formContent.classList.add('show');
            const icon = formToggle.querySelector('.toggle-icon');
            if (icon) icon.classList.remove('collapsed');
        }

        // Isi form dengan data warga yang akan diedit
        document.getElementById('nik').value = warga.nik;
        document.getElementById('nama_lengkap').value = warga.nama_lengkap;
        document.getElementById('alamat').value = warga.alamat;
        document.getElementById('no_telepon').value = warga.no_telepon || '';

        // Ubah tombol submit menjadi mode edit
        const submitBtn = formWarga.querySelector('button[type="submit"]');
        submitBtn.textContent = '💾 Update Warga';
        submitBtn.style.backgroundColor = '#FF9800';

        // Tambahkan tombol cancel
        let cancelBtn = document.getElementById('cancel-edit-btn');
        if (!cancelBtn) {
            cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.id = 'cancel-edit-btn';
            cancelBtn.textContent = '❌ Cancel';
            cancelBtn.style.backgroundColor = '#757575';
            cancelBtn.style.marginLeft = '10px';
            cancelBtn.onclick = resetForm;
            submitBtn.parentElement.appendChild(cancelBtn);
        }

        // Simpan ID warga yang sedang diedit
        formWarga.dataset.editId = warga.id;

        // Scroll ke form
        formWarga.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Fungsi untuk delete warga
    function deleteWarga(id, namaLengkap) {
        if (!confirm(`Apakah Anda yakin ingin menghapus data warga "${namaLengkap}"?`)) {
            return;
        }

        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (authToken) {
            headers['Authorization'] = `Token ${authToken}`;
        }

        fetch(`${apiUrl}${id}/`, {
            method: 'DELETE',
            headers: headers
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Delete failed');
            }
            showMessage(messageDiv, `✅ Data warga "${namaLengkap}" berhasil dihapus!`, false);
            
            // Reload current page, atau ke page sebelumnya jika page ini kosong
            const itemsInCurrentPage = totalCount - ((currentPage - 1) * 3);
            if (itemsInCurrentPage <= 1 && currentPage > 1) {
                loadWargaList(currentPage - 1);
            } else {
                loadWargaList(currentPage);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage(messageDiv, 'Gagal menghapus data warga. Pastikan Anda memiliki izin.', true);
        });
    }

    // Fungsi untuk reset form ke mode tambah
    function resetForm() {
        formWarga.reset();
        delete formWarga.dataset.editId;
        
        const submitBtn = formWarga.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Tambah Warga';
        submitBtn.style.backgroundColor = '#4CAF50';
        
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.remove();
        }
    }

    // Update pagination UI
    function updatePaginationUI() {
        const paginationControls = document.getElementById('pagination-controls');
        const pageInfo = document.getElementById('page-info');
        const statsInfo = document.getElementById('stats-info');
        const btnFirst = document.getElementById('btn-first');
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const btnLast = document.getElementById('btn-last');

        if (!paginationControls) return;

        // Show pagination if there are results
        if (totalCount > 0) {
            paginationControls.style.display = 'flex';
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            
            // Update stats
            const startItem = (currentPage - 1) * 3 + 1;
            const endItem = Math.min(currentPage * 3, totalCount);
            statsInfo.textContent = `Showing ${startItem}-${endItem} of ${totalCount} warga`;

            // Enable/disable buttons
            btnFirst.disabled = currentPage === 1;
            btnPrev.disabled = currentPage === 1;
            btnNext.disabled = currentPage === totalPages;
            btnLast.disabled = currentPage === totalPages;
        } else {
            paginationControls.style.display = 'none';
            statsInfo.textContent = '';
        }
    }

    // Fungsi untuk memuat daftar warga dengan pagination
    function loadWargaList(page = 1) {
        currentPage = page;
        wargaListContainer.innerHTML = '<p>⏳ Memuat data...</p>';
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (authToken) {
            headers['Authorization'] = `Token ${authToken}`;
        }
        
        // Tambahkan parameter page ke URL
        const url = `${apiUrl}?page=${page}`;
        
        fetch(url, {
            method: 'GET',
            headers: headers
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            wargaListContainer.innerHTML = '';
            
            // Update pagination info
            totalCount = data.count || 0;
            totalPages = Math.ceil(totalCount / 3); // 3 items per page (from PAGE_SIZE in Django)
            
            if (data.results && data.results.length > 0) {
                data.results.forEach(warga => {
                    const wargaElement = renderWarga(warga);
                    wargaListContainer.appendChild(wargaElement);
                });
            } else {
                wargaListContainer.innerHTML = '<p style="text-align: center; color: #999;">📭 Belum ada data warga.</p>';
            }
            
            updatePaginationUI();
        })
        .catch(error => {
            wargaListContainer.innerHTML = '<p style="color: #f44336;">❌ Gagal memuat data. Pastikan server backend berjalan.</p>';
            console.error('There has been a problem with your fetch operation:', error);
        });
    }

    // Event listener untuk form submit
    if (formWarga) {
        formWarga.addEventListener('submit', (event) => {
            event.preventDefault();

            const nik = document.getElementById('nik').value;
            const namaLengkap = document.getElementById('nama_lengkap').value;
            const alamat = document.getElementById('alamat').value;
            const noTelepon = document.getElementById('no_telepon').value;

            const wargaData = {
                nik: nik,
                nama_lengkap: namaLengkap,
                alamat: alamat,
                no_telepon: noTelepon || ''
            };

            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (authToken) {
                headers['Authorization'] = `Token ${authToken}`;
            }

            // Cek apakah mode edit atau tambah
            const editId = formWarga.dataset.editId;
            const isEdit = !!editId;
            const url = isEdit ? `${apiUrl}${editId}/` : apiUrl;
            const method = isEdit ? 'PUT' : 'POST';

            fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(wargaData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw err;
                    });
                }
                return response.json();
            })
            .then(data => {
                const successMsg = isEdit ? 
                    '✅ Data warga berhasil diupdate!' : 
                    '✅ Data warga berhasil ditambahkan!';
                showMessage(messageDiv, successMsg, false);
                
                resetForm();
                
                // Collapse form setelah submit berhasil
                if (formContent) {
                    formContent.classList.remove('show');
                    const icon = formToggle.querySelector('.toggle-icon');
                    if (icon) icon.classList.add('collapsed');
                }
                
                // Reload data
                if (isEdit) {
                    loadWargaList(currentPage); // Stay on current page for edit
                } else {
                    loadWargaList(1); // Go to first page for new data
                }
            })
            .catch(error => {
                console.error('Error:', error);
                let errorMessage = isEdit ? 
                    'Gagal mengupdate data warga. ' : 
                    'Gagal menambahkan data warga. ';
                
                if (error.nik) {
                    errorMessage += `NIK: ${error.nik.join(', ')}. `;
                }
                if (error.nama_lengkap) {
                    errorMessage += `Nama: ${error.nama_lengkap.join(', ')}. `;
                }
                if (error.detail) {
                    errorMessage += error.detail;
                }
                
                showMessage(messageDiv, errorMessage, true);
            });
        });
    }

    // Muat daftar warga saat halaman pertama kali dibuka
    loadWargaList(1);

    // Make pagination functions global for onclick handlers
    window.goToFirstPage = () => loadWargaList(1);
    window.goToPrevPage = () => loadWargaList(Math.max(1, currentPage - 1));
    window.goToNextPage = () => loadWargaList(Math.min(totalPages, currentPage + 1));
    window.goToLastPage = () => loadWargaList(totalPages);
}

// ============================================
// PENGADUAN PAGE LOGIC
// ============================================

// Global pagination variables for pengaduan
let currentPagePengaduan = 1;
let totalPagesPengaduan = 1;
let totalCountPengaduan = 0;
let wargaList = []; // Cache warga list for dropdown

function initPengaduanPage() {
    const pengaduanListContainer = document.getElementById('pengaduan-list-container');
    const formPengaduan = document.getElementById('form-pengaduan');
    const messageDiv = document.getElementById('message');
    const userInfoDiv = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const formToggle = document.getElementById('form-toggle');
    const formContent = document.getElementById('form-content');
    const pelaporSelect = document.getElementById('pelapor');
    const apiUrl = 'http://127.0.0.1:8000/api/pengaduan/';
    const wargaApiUrl = 'http://127.0.0.1:8000/api/warga/';

    if (!pengaduanListContainer) return;

    const authToken = getAuthToken();
    const username = getUsername();

    // Toggle form collapse/expand
    if (formToggle && formContent) {
        formToggle.addEventListener('click', () => {
            formContent.classList.toggle('show');
            const icon = formToggle.querySelector('.toggle-icon');
            icon.classList.toggle('collapsed');
        });
    }

    // Tampilkan user info jika sudah login
    if (authToken && username && userInfoDiv) {
        userInfoDiv.style.display = 'flex';
        if (usernameDisplay) usernameDisplay.textContent = username;

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Yakin ingin logout?')) {
                    clearAuthToken();
                    showMessage(messageDiv, 'Logout berhasil! Redirecting...', false);
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                }
            });
        }
    }

    // Load warga list for dropdown
    function loadWargaDropdown() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (authToken) {
            headers['Authorization'] = `Token ${authToken}`;
        }

        // Load all warga (no pagination needed for dropdown)
        fetch(`${wargaApiUrl}?page_size=1000`, {
            method: 'GET',
            headers: headers
        })
        .then(response => response.json())
        .then(data => {
            wargaList = data.results || [];
            pelaporSelect.innerHTML = '<option value="">-- Pilih Warga --</option>';
            wargaList.forEach(warga => {
                const option = document.createElement('option');
                option.value = warga.id;
                option.textContent = `${warga.nama_lengkap} (NIK: ${warga.nik})`;
                pelaporSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading warga:', error);
        });
    }

    // Fungsi untuk render data pengaduan
    function renderPengaduan(pengaduan) {
        const pengaduanDiv = document.createElement('div');
        pengaduanDiv.className = 'pengaduan-item';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'pengaduan-content';

        const judul = document.createElement('h3');
        judul.textContent = pengaduan.judul;

        const pelapor = document.createElement('p');
        const pelaporData = wargaList.find(w => w.id === pengaduan.pelapor);
        const pelaporNama = pelaporData ? pelaporData.nama_lengkap : `ID: ${pengaduan.pelapor}`;
        pelapor.innerHTML = `<strong>👤 Pelapor:</strong> ${pelaporNama}`;

        const isi = document.createElement('p');
        isi.innerHTML = `<strong>📝 Isi:</strong> ${pengaduan.isi}`;

        const status = document.createElement('span');
        status.className = `status-badge status-${pengaduan.status}`;
        status.textContent = pengaduan.status;

        contentDiv.appendChild(judul);
        contentDiv.appendChild(pelapor);
        contentDiv.appendChild(isi);
        contentDiv.appendChild(status);

        // Tombol aksi (Edit & Delete)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'pengaduan-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = '✏️ Edit';
        editBtn.onclick = () => editPengaduan(pengaduan);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.onclick = () => deletePengaduan(pengaduan.id, pengaduan.judul);

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        pengaduanDiv.appendChild(contentDiv);
        pengaduanDiv.appendChild(actionsDiv);

        return pengaduanDiv;
    }

    // Fungsi untuk edit pengaduan
    function editPengaduan(pengaduan) {
        // Tampilkan form jika tersembunyi
        if (formContent) {
            formContent.classList.add('show');
            const icon = formToggle.querySelector('.toggle-icon');
            if (icon) icon.classList.remove('collapsed');
        }

        // Isi form dengan data pengaduan yang akan diedit
        document.getElementById('pelapor').value = pengaduan.pelapor;
        document.getElementById('judul').value = pengaduan.judul;
        document.getElementById('isi').value = pengaduan.isi;
        document.getElementById('status').value = pengaduan.status;

        // Ubah tombol submit menjadi mode edit
        const submitBtn = formPengaduan.querySelector('button[type="submit"]');
        submitBtn.textContent = '💾 Update Pengaduan';
        submitBtn.style.backgroundColor = '#FF9800';

        // Tambahkan tombol cancel
        let cancelBtn = document.getElementById('cancel-edit-btn');
        if (!cancelBtn) {
            cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.id = 'cancel-edit-btn';
            cancelBtn.textContent = '❌ Cancel';
            cancelBtn.style.backgroundColor = '#757575';
            cancelBtn.style.marginLeft = '10px';
            cancelBtn.onclick = resetFormPengaduan;
            submitBtn.parentElement.appendChild(cancelBtn);
        }

        // Simpan ID pengaduan yang sedang diedit
        formPengaduan.dataset.editId = pengaduan.id;

        // Scroll ke form
        formPengaduan.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Fungsi untuk delete pengaduan
    function deletePengaduan(id, judul) {
        if (!confirm(`Apakah Anda yakin ingin menghapus pengaduan "${judul}"?`)) {
            return;
        }

        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (authToken) {
            headers['Authorization'] = `Token ${authToken}`;
        }

        fetch(`${apiUrl}${id}/`, {
            method: 'DELETE',
            headers: headers
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Delete failed');
            }
            showMessage(messageDiv, `✅ Pengaduan "${judul}" berhasil dihapus!`, false);
            
            // Reload current page, atau ke page sebelumnya jika page ini kosong
            const itemsInCurrentPage = totalCountPengaduan - ((currentPagePengaduan - 1) * 3);
            if (itemsInCurrentPage <= 1 && currentPagePengaduan > 1) {
                loadPengaduanList(currentPagePengaduan - 1);
            } else {
                loadPengaduanList(currentPagePengaduan);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage(messageDiv, 'Gagal menghapus pengaduan. Pastikan Anda memiliki izin.', true);
        });
    }

    // Fungsi untuk reset form ke mode tambah
    function resetFormPengaduan() {
        formPengaduan.reset();
        delete formPengaduan.dataset.editId;
        
        const submitBtn = formPengaduan.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Tambah Pengaduan';
        submitBtn.style.backgroundColor = '#FF5722';
        
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.remove();
        }
    }

    // Update pagination UI
    function updatePaginationUIPengaduan() {
        const paginationControls = document.getElementById('pagination-controls');
        const pageInfo = document.getElementById('page-info');
        const statsInfo = document.getElementById('stats-info');
        const btnFirst = document.getElementById('btn-first');
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const btnLast = document.getElementById('btn-last');

        if (!paginationControls) return;

        // Show pagination if there are results
        if (totalCountPengaduan > 0) {
            paginationControls.style.display = 'flex';
            pageInfo.textContent = `Page ${currentPagePengaduan} of ${totalPagesPengaduan}`;
            
            // Update stats
            const startItem = (currentPagePengaduan - 1) * 3 + 1;
            const endItem = Math.min(currentPagePengaduan * 3, totalCountPengaduan);
            statsInfo.textContent = `Showing ${startItem}-${endItem} of ${totalCountPengaduan} pengaduan`;

            // Enable/disable buttons
            btnFirst.disabled = currentPagePengaduan === 1;
            btnPrev.disabled = currentPagePengaduan === 1;
            btnNext.disabled = currentPagePengaduan === totalPagesPengaduan;
            btnLast.disabled = currentPagePengaduan === totalPagesPengaduan;
        } else {
            paginationControls.style.display = 'none';
            statsInfo.textContent = '';
        }
    }

    // Fungsi untuk memuat daftar pengaduan dengan pagination
    function loadPengaduanList(page = 1) {
        currentPagePengaduan = page;
        pengaduanListContainer.innerHTML = '<p>⏳ Memuat data...</p>';
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (authToken) {
            headers['Authorization'] = `Token ${authToken}`;
        }
        
        // Tambahkan parameter page ke URL
        const url = `${apiUrl}?page=${page}`;
        
        fetch(url, {
            method: 'GET',
            headers: headers
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            pengaduanListContainer.innerHTML = '';
            
            // Update pagination info
            totalCountPengaduan = data.count || 0;
            totalPagesPengaduan = Math.ceil(totalCountPengaduan / 3); // 3 items per page
            
            if (data.results && data.results.length > 0) {
                data.results.forEach(pengaduan => {
                    const pengaduanElement = renderPengaduan(pengaduan);
                    pengaduanListContainer.appendChild(pengaduanElement);
                });
            } else {
                pengaduanListContainer.innerHTML = '<p style="text-align: center; color: #999;">📭 Belum ada data pengaduan.</p>';
            }
            
            updatePaginationUIPengaduan();
        })
        .catch(error => {
            pengaduanListContainer.innerHTML = '<p style="color: #f44336;">❌ Gagal memuat data. Pastikan server backend berjalan.</p>';
            console.error('There has been a problem with your fetch operation:', error);
        });
    }

    // Event listener untuk form submit
    if (formPengaduan) {
        formPengaduan.addEventListener('submit', (event) => {
            event.preventDefault();

            const pelapor = document.getElementById('pelapor').value;
            const judul = document.getElementById('judul').value;
            const isi = document.getElementById('isi').value;
            const status = document.getElementById('status').value;

            const pengaduanData = {
                pelapor: parseInt(pelapor),
                judul: judul,
                isi: isi,
                status: status
            };

            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (authToken) {
                headers['Authorization'] = `Token ${authToken}`;
            }

            // Cek apakah mode edit atau tambah
            const editId = formPengaduan.dataset.editId;
            const isEdit = !!editId;
            const url = isEdit ? `${apiUrl}${editId}/` : apiUrl;
            const method = isEdit ? 'PUT' : 'POST';

            fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(pengaduanData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw err;
                    });
                }
                return response.json();
            })
            .then(data => {
                const successMsg = isEdit ? 
                    '✅ Pengaduan berhasil diupdate!' : 
                    '✅ Pengaduan berhasil ditambahkan!';
                showMessage(messageDiv, successMsg, false);
                
                resetFormPengaduan();
                
                // Collapse form setelah submit berhasil
                if (formContent) {
                    formContent.classList.remove('show');
                    const icon = formToggle.querySelector('.toggle-icon');
                    if (icon) icon.classList.add('collapsed');
                }
                
                // Reload data
                if (isEdit) {
                    loadPengaduanList(currentPagePengaduan); // Stay on current page for edit
                } else {
                    loadPengaduanList(1); // Go to first page for new data
                }
            })
            .catch(error => {
                console.error('Error:', error);
                let errorMessage = isEdit ? 
                    'Gagal mengupdate pengaduan. ' : 
                    'Gagal menambahkan pengaduan. ';
                
                if (error.pelapor) {
                    errorMessage += `Pelapor: ${error.pelapor.join(', ')}. `;
                }
                if (error.judul) {
                    errorMessage += `Judul: ${error.judul.join(', ')}. `;
                }
                if (error.detail) {
                    errorMessage += error.detail;
                }
                
                showMessage(messageDiv, errorMessage, true);
            });
        });
    }

    // Load warga dropdown first
    loadWargaDropdown();
    
    // Muat daftar pengaduan saat halaman pertama kali dibuka
    loadPengaduanList(1);

    // Make pagination functions global for onclick handlers
    window.goToFirstPagePengaduan = () => loadPengaduanList(1);
    window.goToPrevPagePengaduan = () => loadPengaduanList(Math.max(1, currentPagePengaduan - 1));
    window.goToNextPagePengaduan = () => loadPengaduanList(Math.min(totalPagesPengaduan, currentPagePengaduan + 1));
    window.goToLastPagePengaduan = () => loadPengaduanList(totalPagesPengaduan);
}

// ============================================
// AUTO-INITIALIZE BASED ON CURRENT PAGE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = getCurrentPage();
    
    console.log('Current page:', currentPage);
    
    switch(currentPage) {
        case 'login':
            initLoginPage();
            break;
        case 'set-token':
            initSetTokenPage();
            break;
        case 'index':
            initIndexPage();
            break;
        case 'pengaduan':
            initPengaduanPage();
            break;
        case 'test-login':
            // Test login page has its own inline script
            break;
        default:
            console.log('Unknown page or no initialization needed');
    }
});
