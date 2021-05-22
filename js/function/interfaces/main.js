(function () {

    window.onload = function () {
        window.setTimeout(fadeout, 500);
    }

    function fadeout() {
        document.querySelector('.preloader').style.opacity = '0';
        document.querySelector('.preloader').style.display = 'none';
        // window.location.href = "/fim.html";
    }

    // section menu active
    function onScroll(event) {
        var sections = document.querySelectorAll('.page-scroll');
        var scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

        for (var i = 0; i < sections.length; i++) {
            var currLink = sections[i];
            var val = currLink.getAttribute('href');
            var refElement = document.querySelector(val);
            var scrollTopMinus = scrollPos + 73;
            if (refElement.offsetTop <= scrollTopMinus && (refElement.offsetTop + refElement.offsetHeight > scrollTopMinus)) {
                document.querySelector('.page-scroll').classList.remove('active');
                currLink.classList.add('active');
            } else {
                currLink.classList.remove('active');
            }
        }
    };

    window.document.addEventListener('scroll', onScroll);

    //===== close navbar-collapse when a  clicked
    let navbarToggler = document.querySelector(".navbar-toggler");
    var navbarCollapse = document.querySelector(".navbar-collapse");

    navbarToggler.addEventListener('click', () => {
        navbarToggler.classList.toggle('active')
    })

    document.querySelectorAll(".page-scroll").forEach(e =>
        e.addEventListener("click", () => {
            navbarToggler.classList.remove("active");
            navbarCollapse.classList.remove('show')
        })
    );

    var wow = new WOW();
    wow.init();

    window.preview_image = function (e) {
        var reader = new FileReader();
        reader.onload = function () {
            var output = document.getElementById('output_image');
            var contain = document.getElementById('contain');
            var imagContain = document.getElementById('image-contain');
            // output.src = reader.result;
            document.getElementById('contain').style.display = 'none';
            document.getElementById('image-contain').style.display = '';
            document.getElementById('image-contain').style.marginTop = '120px';
            document.getElementById('image-contain').style.marginLeft = '36px';
        }
        reader.readAsDataURL(e.target.files[0]);
    }
    var btnvideo = document.getElementById('openVideo');
    btnvideo.addEventListener("click", function () {
        document.getElementById('video').style.display = '';
        document.getElementById('contain').style.display = 'none';

    });
})();
