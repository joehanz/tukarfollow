(function(){

  function startRatingSystem(){

    if(typeof firebase === 'undefined') return false;

    var filmId =
      location.pathname.replace(/\W/g,'');

    // USER ID
    function getUserId(){

      var userId =
        localStorage.getItem('userId');

      if(!userId){

        userId =
          'user_' +
          Math.random()
          .toString(36)
          .substr(2,9);

        localStorage.setItem(
          'userId',
          userId
        );

      }

      return userId;

    }

    var userId = getUserId();

    var db = firebase.database();

    var userRef =
      db.ref(
        'ratings/' +
        filmId +
        '/users/' +
        userId
      );

    var stars =
      document.querySelectorAll(
        '.rating-box .star'
      );

    var userRatingText =
      document.getElementById(
        'userRatingText'
      );

    var ratingResult =
      document.getElementById(
        'ratingResult'
      );

    if(!stars.length) return false;

    // SET STAR
    function setStar(nilai){

      stars.forEach(function(star){

        if(
          Number(star.dataset.value)
          <= nilai
        ){

          star.classList.add('active');

        }else{

          star.classList.remove('active');

        }

      });

    }

    // HOVER
    stars.forEach(function(star){

      star.addEventListener(
        'mouseenter',
        function(){

          var val =
            Number(this.dataset.value);

          stars.forEach(function(s){

            s.classList.toggle(
              'hover',
              Number(s.dataset.value)
              <= val
            );

          });

        }
      );

      star.addEventListener(
        'mouseleave',
        function(){

          stars.forEach(function(s){

            s.classList.remove('hover');

          });

        }
      );

    });

    // CLICK RATE
    stars.forEach(function(star){

      star.addEventListener(
        'click',
        function(){

          var nilai =
            Number(this.dataset.value);

          userRef.once(
            'value',
            function(snapshot){

              if(snapshot.exists()){

                alert(
                  'Kamu sudah memberi rating!'
                );

                return;

              }

              userRef.set({
                rating: nilai,
                time: Date.now()
              });

              setStar(nilai);

              userRatingText.innerHTML =
                'Rating kamu: ' +
                nilai +
                ' ⭐';

            }
          );

        }
      );

    });

    // LOAD USER RATING
    userRef.once(
      'value',
      function(snapshot){

        if(snapshot.exists()){

          var data = snapshot.val();

          var val;

          // FORMAT BARU
          if(typeof data === 'object'){

            val = Number(data.rating);

          }

          // FORMAT LAMA
          else{

            val = Number(data);

          }

          if(val){

            setStar(val);

            userRatingText.innerHTML =
              'Rating kamu: ' +
              val +
              ' ⭐';

          }

        }

      }
    );

    // REALTIME RESULT
    db.ref(
      'ratings/' +
      filmId +
      '/users'
    ).on(
      'value',
      function(snapshot){

        var total = 0;
        var jumlah = 0;

        snapshot.forEach(function(child){

          var data = child.val();

          var rating = 0;

          // FORMAT BARU
          if(typeof data === 'object'){

            rating = Number(data.rating);

          }

          // FORMAT LAMA
          else{

            rating = Number(data);

          }

          if(rating > 0){

            total += rating;
            jumlah++;

          }

        });

        if(jumlah > 0){

          var rata =
            (total / jumlah)
            .toFixed(1);

          ratingResult.innerHTML =
            '⭐ ' +
            rata +
            ' dari ' +
            jumlah +
            ' vote';

        }else{

          ratingResult.innerHTML =
            'Belum ada rating';

        }

      }
    );

    return true;

  }

  // RETRY FIREBASE READY
  var tries = 0;

  var timer = setInterval(function(){

    tries++;

    if(
      startRatingSystem()
      || tries > 50
    ){

      clearInterval(timer);

    }

  },100);

})();
