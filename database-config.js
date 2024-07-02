// Import fungsi yang dibutuhkan dan dipakai
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getDatabase, set, get, update, remove, push, ref as databaseRef, child, onValue, orderByChild } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
   apiKey: "AIzaSyBxo9FAD9BZ1uE3iKwiBDlQLd8UYbNsQpA",
   authDomain: "project-cd00c.firebaseapp.com",
   databaseURL: "https://project-cd00c-default-rtdb.asia-southeast1.firebasedatabase.app",
   projectId: "project-cd00c",
   storageBucket: "project-cd00c.appspot.com",
   messagingSenderId: "835124692629",
   appId: "1:835124692629:web:de0ce9a5890d288a5dbd9c",
   measurementId: "G-TNH2Y8GNS4"
};

// Menginisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Menginisialisasi Storage
const storage = getStorage(app);

// Menginisialisasi Database
const db = getDatabase();

// Proses Admin Signin
document.addEventListener("DOMContentLoaded", () => {

   document.getElementById('admin-submit').addEventListener('click', function (event) {
      event.preventDefault(); // Mencegah form dari pengiriman default

      var email = document.getElementById('admin-email').value;
      var password = document.getElementById('admin-password').value;

      if (email === 'admin@admin.com' && password === 'superadmin123') {
         // Jika email dan password benar, arahkan ke halaman admin
         window.location.href = 'pages/admin-home.html';
      } else {
         // Jika email atau password salah, tampilkan pesan kesalahan
         alert('Email atau password salah. Silakan coba lagi.');
      }
   });
});


// PROSES MEMBUAT ARTIKEL
document.addEventListener("DOMContentLoaded", () => {
   // Mendapatkan elemen input
   const articleTitleInput = document.querySelector("#article-title");
   const articleCategoryInput = document.querySelector("#article-category");
   const articleContentInput = document.querySelector("#content-article");
   const articleImageInput = document.querySelector("#file_input");

   // Tombol submit
   const createArticleBtn = document.querySelector("#create-article-btn");

   // Inisialisasi fungsi untuk membuat artikel
   const createArticle = async () => {
      // Mendapatkan file gambar yang diunggah
      const imageFile = articleImageInput.files[0];

      // Jika input tidak terisi maka tampilkan pesan error 
      if (!imageFile || !articleTitleInput.value || !articleCategoryInput.value || !articleContentInput.value) {
         alert("Please fill out all fields");
         return;
      }

      // Upload gambar ke Firebase Storage
      const storageReference = storageRef(storage, `Images/${imageFile.name}`);
      await uploadBytes(storageReference, imageFile);

      // Mendapatkan URL gambar yang diunggah
      const imageURL = await getDownloadURL(storageReference);

      // Menyimpan data artikel ke Firebase Realtime Database
      await set(push(databaseRef(db, "Articles")), {
         ArticleTitle: articleTitleInput.value,
         ArticleCategory: articleCategoryInput.value,
         ArticleContent: articleContentInput.value,
         ArticleImage: imageURL, // Menyimpan URL gambar
         CreatedAt: new Date().toISOString()
      })
         .then(() => {
            // Menampilkan pesan sukses
            alert("Article created successfully!");
            window.location.reload();
         })
         .catch((error) => {
            // Menampilkan pesan error
            alert("Error creating article: " + error);
         });
   };

   // Menjalankan fungsi createRecipe ketika tombol create recipe ditekan
   createArticleBtn.addEventListener("click", (event) => {
      event.preventDefault(); // Mencegah halaman untuk reload atau action default lainnya
      createArticle();
   });
});

document.addEventListener("DOMContentLoaded", () => {
   const listGuideDiv = document.getElementById('list-guide');
   const sortSelect = document.getElementById('sort');

   // Fungsi untuk membuat tabel artikel
   const createArticleTable = (articles) => {
      let tableHTML = `
           <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
               <thead class="bg-gray-100 dark:bg-gray-700 text-gray-100">
                   <tr>
                       <th class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left">No</th>
                       <th class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left">Gambar</th>
                       <th class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left">Judul</th>
                       <th class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left">Kategori</th>
                       <th class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left">Konten</th>
                       <th class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left">Tanggal Pembuatan</th>
                       <th class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-center">Aksi</th>
                   </tr>
               </thead>
               <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
           `;

      articles.forEach((article, index) => {
         const truncatedContent = article.ArticleContent.length > 20
            ? article.ArticleContent.substring(0, 20) + '...'
            : article.ArticleContent;

         // Mengubah string tanggal ISO ke objek Date
         const createdAtDate = new Date(article.CreatedAt);

         // Mengambil bagian-bagian dari tanggal
         const day = createdAtDate.getDate();
         const month = createdAtDate.getMonth() + 1;
         const year = createdAtDate.getFullYear();
         const hours = createdAtDate.getHours();
         const minutes = createdAtDate.getMinutes();

         // Membuat format tanggal dan waktu
         const formattedDate = `${day}-${month}-${year}`;
         const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

         tableHTML += `
               <tr>
                   <td class="py-2 px-4 text-gray-800 dark:text-gray-200">${index + 1}</td>
                   <td class="py-2 px-4">
                       <img src="${article.ArticleImage}" alt="Gambar" class="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600">
                   </td>
                   <td class="py-2 px-4 text-gray-800 dark:text-gray-200 text-md md:text-md lg:text-lg">${article.ArticleTitle}</td>
                   <td class="py-2 px-4 text-gray-800 dark:text-gray-200">${article.ArticleCategory}</td>
                   <td class="py-2 px-4 text-gray-800 dark:text-gray-200">${truncatedContent}</td>
                   <td class="py-2 px-4 text-gray-800 dark:text-gray-200">${formattedDate} ${formattedTime}</td>
                   <td >
                       <button class="text-blue-500 hover:text-blue-700 edit-article px-4" data-id="${article.id}" title="Edit">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-7 h-7">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11.2v5.2h5.2l8-8-5.2-5.2-8 8zM16 2v4m0 0h4M16 6l-2.5-2.5-2 2 2.5 2.5 2-2z"/>
                           </svg>
                       </button>
                       <button class="text-red-500 hover:text-red-700 delete-article" data-id="${article.id}" title="Delete">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-7 h-7">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                           </svg>
                       </button>
                   </td>
               </tr>
           `;
      });

      tableHTML += `
               </tbody>
           </table>
       `;

      listGuideDiv.innerHTML = tableHTML;

      // Menambahkan event listener untuk tombol edit
      document.querySelectorAll('.edit-article').forEach(button => {
         button.addEventListener('click', (event) => {
            const articleId = event.target.closest('button').getAttribute('data-id');
            editArticle(articleId);
         });
      });

      // Menambahkan event listener untuk tombol delete
      document.querySelectorAll('.delete-article').forEach(button => {
         button.addEventListener('click', (event) => {
            const articleId = event.target.closest('button').getAttribute('data-id');
            deleteArticle(articleId);
         });
      });
   };

   // Fungsi untuk mengambil artikel dari Firebase
   const fetchArticles = async () => {
      const articlesRef = databaseRef(db, 'Articles');
      onValue(articlesRef, (snapshot) => {
         const articles = [];
         snapshot.forEach((childSnapshot) => {
            articles.push({ id: childSnapshot.key, ...childSnapshot.val() });
         });
         sortAndDisplayArticles(articles);
      });
   };

   // Fungsi untuk sorting artikel dan menampilkan
   const sortAndDisplayArticles = (articles) => {
      const sortValue = sortSelect.value;

      if (sortValue === 'newest') {
         articles.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
      } else if (sortValue === 'oldest') {
         articles.sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
      } else if (sortValue) {
         articles = articles.filter(article => article.ArticleCategory.toLowerCase() === sortValue);
      } else {
         // Default sort: Newest first
         articles.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
      }

      createArticleTable(articles);
   };

   sortSelect.addEventListener('change', () => {
      fetchArticles();
   });

   // Fungsi untuk menghapus artikel
   const deleteArticle = async (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
         try {
            await remove(databaseRef(db, `Articles/${id}`));
            alert('Artikel berhasil dihapus.');
            fetchArticles();
         } catch (error) {
            alert('Gagal menghapus artikel: ' + error.message);
         }
      }
   };

   // Fungsi untuk mengedit artikel
   const editArticle = (id) => {
      // Di sini Anda dapat menentukan bagaimana proses pengeditan artikel dilakukan,
      // misalnya menavigasi ke halaman pengeditan atau menampilkan formulir di tempat.
      // Contoh:
      window.location.href = `/pages/admin-edit.html?id=${id}`;
      // Implementasikan logika pengeditan artikel sesuai dengan kebutuhan aplikasi Anda.
   };

   fetchArticles();
});

// Edit
document.addEventListener("DOMContentLoaded", () => {
   // Mendapatkan elemen select untuk kategori artikel
   const categorySelect = document.getElementById("article-category-edit");

   // Mendapatkan elemen HTML lainnya
   const displayCurrentThumbnailImage = document.querySelector("#display-thumbnail-image");
   const articleTitleInput = document.querySelector("#article-title-edit");
   const articleContentInput = document.querySelector("#content-article-edit");
   const articleImageInput = document.querySelector("#file_input-edit");
   const updateArticleButton = document.querySelector("#edit-article-btn");
   const deleteArticleButton = document.querySelector("#delete-article-btn");

   // Mendapatkan UID dari query parameter URL
   function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
   }

   const uid = getQueryParam("id"); // Mengubah dari "uid" menjadi "id" sesuai dengan query parameter URL

   // Fungsi untuk menetapkan nilai default dropdown berdasarkan data artikel
   if (uid) {
      const articleRef = databaseRef(db, `Articles/${uid}`);

      get(articleRef).then((snapshot) => {
         if (snapshot.exists()) {
            const articleData = snapshot.val();
            categorySelect.value = articleData.ArticleCategory;
            articleTitleInput.value = articleData.ArticleTitle;
            simplemde.value(articleData.ArticleContent); // Pastikan SimpleMDE sudah diinisialisasi dengan benar
            displayCurrentThumbnailImage.src = articleData.ArticleImage;
         } else {
            console.log("No data available");
         }
      }).catch((error) => {
         console.log("Error getting data: ", error);
      });
   } else {
      console.log("No UID provided");
   }

   // Fungsi untuk update artikel
   function updateArticle() {
      const imageFile = articleImageInput.files[0];
      const articleRef = databaseRef(db, `Articles/${uid}`);

      function updateArticleData(imageURL) {
         update(articleRef, {
            ArticleTitle: articleTitleInput.value,
            ArticleCategory: categorySelect.value,
            ArticleContent: articleContentInput.value,
            ArticleImage: imageURL || displayCurrentThumbnailImage.src
         }).then(() => {
            alert("Article updated successfully!");
            window.location.href = "/pages/admin-home.html";
         }).catch((error) => {
            console.error("Error updating article: ", error);
            alert("Failed to update article. Please try again.");
         });
      }

      if (imageFile) {
         const storageImageRef = storageRef(storage, `Images/${imageFile.name}`);
         uploadBytes(storageImageRef, imageFile).then(() => {
            return getDownloadURL(storageImageRef);
         }).then((imageURL) => {
            updateArticleData(imageURL);
         }).catch((error) => {
            console.error("Error uploading image: ", error);
            alert("Failed to upload image. Please try again.");
         });
      } else {
         updateArticleData();
      }
   }

   // Event listener untuk tombol update
   updateArticleButton.addEventListener("click", (event) => {
      event.preventDefault();
      updateArticle();
   });

   // Fungsi untuk menghapus artikel
   function deleteArticle() {
      const articleRef = databaseRef(db, `Articles/${uid}`);

      get(articleRef).then((snapshot) => {
         if (snapshot.exists()) {
            const articleData = snapshot.val();
            const imageURL = articleData.ArticleImage;

            remove(articleRef).then(() => {
               alert("Article deleted successfully!");

               // Hapus juga gambar dari storage jika ada
               if (imageURL) {
                  const imageName = decodeURIComponent(imageURL.split('/o/')[1].split('?')[0]);
                  const storageImageRef = storageRef(storage, imageName);

                  deleteObject(storageImageRef).then(() => {
                     console.log("Image deleted successfully from storage.");
                  }).catch((error) => {
                     console.error("Error deleting image from storage: ", error);
                  });
               }

               window.location.href = "admin-home.html"; // Redirect atau atur tindakan lainnya setelah penghapusan berhasil
            }).catch((error) => {
               console.error("Error deleting article: ", error);
               alert("Failed to delete article. Please try again.");
            });
         } else {
            console.log("No data available for the given UID.");
            alert("Article not found. Please check the UID.");
         }
      }).catch((error) => {
         console.error("Error retrieving article: ", error);
      });
   }

   // Event listener untuk tombol delete
   deleteArticleButton.addEventListener("click", (event) => {
      event.preventDefault();
      const confirmDelete = confirm("Are you sure you want to delete this article? This action cannot be undone.");
      if (confirmDelete) {
         deleteArticle();
      }
   });
});

// FUNGSI SEARCH
document.addEventListener("DOMContentLoaded", () => {
   const resultBox = document.querySelector("#result-box");
   const inputBox = document.querySelector("#default-search");
   const closeButton = document.querySelector("#close-btn");

   let availableKeywords = [];

   // Mengambil data dari Firebase Realtime Database
   const articleRef = databaseRef(db, 'Articles');
   onValue(articleRef, (snapshot) => {
      const data = snapshot.val();
      availableKeywords = Object.entries(data).map(([uid, item]) => ({
         uid: uid,
         title: item.ArticleTitle
      }));
   });

   inputBox.onkeyup = function () {
      let result = [];
      let input = inputBox.value;

      if (input.length) {
         result = availableKeywords.filter(({ title }) => {
            return title.toLowerCase().includes(input.toLowerCase());
         });
         console.log(result);
      }

      display(result);
   }

   function display(result) {
      if (result.length) {
         const content = result.map(({ uid, title }) => {
            return `
                   <a href='/pages/admin-edit.html?id=${uid}' class='text-gray-900'>                    
                       <li id='list-search' class='py-2'>${title}</li>
                   </a>
               `;
         })

         resultBox.innerHTML = "<ul class='space-y-3 p-2'>" + content.join('') + "</ul>";
         resultBox.style.display = 'block';
      } else {
         resultBox.style.display = 'none';
      }
   }

   closeButton.addEventListener("click", () => {
      resultBox.style.display = 'none';
   });

   document.addEventListener("click", (event) => {
      const isClickInside = resultBox.contains(event.target) || inputBox.contains(event.target);

      if (!isClickInside) {
         resultBox.style.display = 'none';
      }
   });
});