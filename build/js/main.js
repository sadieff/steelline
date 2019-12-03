$(document).ready(function() {

    /* menu */

    $('.menu-open').on('click', function(){
        $(this).toggleClass('active');
        $('.header-menu').toggleClass('active');
        $('body').toggleClass('menu-opened');
    });

    $('.header-menu li.parent > span').on('click', function(){
        $(this).toggleClass('active');
    });

    $('.header-menu li.back').on('click', function(){
        $(this).closest('li.parent').children('span').toggleClass('active');
    });

    /* filter */

    $('.category-open_filter').on('click', function(){
        $.fancybox.open({
            src  : '.category-filter',
            type : 'inline',
            attr: {
                scrolling: "none"
            },
            scrolling : 'visible'
        });
    });

    /* slider */

    if (document.getElementById('slider')) {
        var slider = document.getElementById('slider');
        noUiSlider.create(slider, {
            start: [61000, 180000],
            connect: true,
            range: {
                'min': 0,
                'max': 250000
            }
        });
        var minprice = document.getElementById('minprice');
        var maxprice = document.getElementById('maxprice');

        minprice.addEventListener('change', function () {
            slider.noUiSlider.set([this.value, null]);
        });
        maxprice.addEventListener('change', function () {
            slider.noUiSlider.set([null, this.value]);
        });

        slider.noUiSlider.on('update', function (values, handle) {
            var value = values[handle];
            value = value.split('.');
            value = value[0];
            if (handle) {
                maxprice.value = value;
                $('.maxprice').text(value);
            } else {
                minprice.value = value;
                $('.minprice').text(value);
            }
        });
    }

});