(function () {
    window.onload = function () {


        window.setTimeout(fadeout, 500);

        $(document).ready(function () {
            $('.slider').slick({
                Accessibility: true,
                speed: 300,
                slidesToShow: 4,
                slidesToScroll: 1,
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3,
                            infinite: true,
                        }
                    },
                    {
                        breakpoint: 600,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        });

    }

    function fadeout() {
        document.querySelector('.preloader').style.opacity = '0';
        document.querySelector('.preloader').style.display = 'none';
        // window.location.href = "/fim.html";
    }


    /*=====================================
  Sticky
  ======================================= */
    window.onscroll = function () {
        var header_navbar = document.getElementById("header_navbar");
        var logo = document.querySelector("img#logo");
        var sticky = header_navbar.offsetTop;

        if (window.pageYOffset > sticky) {
            header_navbar.classList.add("sticky");
            logo.setAttribute("src", "/image/logo_header_blue.png")
        } else {
            header_navbar.classList.remove("sticky");
            logo.setAttribute("src", "/image/logo_white.png")
        }

    };

    // Get the navbar


    // for menu scroll 
    var pageLink = document.querySelectorAll('.page-scroll');

    pageLink.forEach(elem => {
        elem.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(elem.getAttribute('href')).scrollIntoView({
                behavior: 'smooth',
                offsetTop: 1 - 60,
            });
        });
    });

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

    window.mybtn = function (e) {
        var html = "";
        html += " <tr>" +
            "<th colspan='4' class='noborder text-muted'>" +
            "<p>" + "Information" + "</p>" +
            "</th>" +
            "</tr >" +
            "<tr>" +
            "<th>" + "Name" + "</th>" +
            "<td>" + "<a>" + "Beyoncé Giselle Know cé Giselle Know" + "</a>" + "</td>" +
            "</tr>" +
            "<tr>" +
            "<th>" + "Age" + "</th>" +
            +"<td>" + "<a>" + "30" + "</a>" + "</td>" +
            "</tr>" +
            "<tr>" +
            "<th>" + "Gender" + "</th>" +
            "<td>" + "<a>" + "Male" + "</a>" + "</td>" +
            "</tr>" +
            "<tr>" +
            "<th>" + "Crime" + "</th>" +
            "<td>" + "<a>" + "Property theft" + "</a>" + "</td>" +
            "</tr>" +
            "<tr>" +
            "<th>" + "Type Crime" + "</th>" +
            "<td>" + "<a>" + "Property crime" + "</a>" + "</td>" +
            "</tr>" +
            "<tr>" +
            "<th>" + "Type Wanted" + "</th>" +
            "<td>" + "<a>" + "High" + "</a>" + "</td>" +
            "</tr>";
        $("table tbody").append(html)
    }

})();
