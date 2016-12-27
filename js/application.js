(function ($) {
    "use strict";
    // Declare our variables:
    var header, main, footer,
        cards, rent, sqft, expandFooter, collapseFooter,
        amenities, expandAmenities, collapseAmenities,
        bedrooms, baths,
        resetall, btnApplyFilter,cancel,
        // default setting for rent slider and bedrooms/bathrooms buttons:
        filterResults = {
            rent: {min: 500, max: 4000},
            bed: -1,
            bath: -1
    };

    function init() {

        header = $('header');
        main = $('main');
        footer = $('footer');
        cards = $('#cards').html('');
        expandFooter = $('#morefilters');
        collapseFooter = $('#less');
        amenities = $('#amenities');
        expandAmenities = $('#amenities a.more');
        collapseAmenities = $('#amenities a.less');
        bedrooms = $('#bedrooms');
        baths = $('#baths');
        resetall = $('#resetall');
        cancel = $('#cancel');
        btnApplyFilter = $('#applyFilter');

        loadData();

        var commands = {
            // 'MORE FILTERS':
            expandFooter: function () {
                footer.addClass('expanded').removeClass('collapsed');
            },
            // 'Cancel' link:
            collapseFooter: function () {
                footer.addClass('collapsed').removeClass('expanded');
            },
            // 'MORE' link:
            expandAmenities: function () {
                amenities.addClass('expanded').removeClass('collapsed');
            },
            // 'LESS' link:
            collapseAmenities: function () {
                amenities.addClass('collapsed').removeClass('expanded');
            },

            // Buttons for 'BEDROOMS'
            selectBedrooms: function () {
                $(this).on('click', function () {
                    var btn = $(this);
                    btn.parent().find('.btn').removeClass('active btn-primary');
                    btn.addClass('active btn-primary');
                    filterResults.bed = btn.index();
                    commands.filterSelection();
                })
            },

            // Buttons for 'BATHROOMS'
            selectBaths: function () {
                $(this).on('click', function () {
                    var btn = $(this);
                    btn.parent().find('.btn').removeClass('active btn-primary');
                    btn.addClass('active btn-primary');
                    filterResults.bath = btn.index();
                    filterResults.bath = btn.index();
                    commands.filterSelection();
                })
            },

            // 'Reset All':
            reset: function () {
                bedrooms.find('.btn').removeClass('active btn-primary');
                baths.find('.btn').removeClass('active btn-primary');
                rent.slider('setValue', [500, 4000], true);
                sqft.slider('setValue', [200, 7250], true);
                amenities.find('input[type=checkbox]').prop('checked', false);

            },

            // Rent Slider:
            rentFilter: function (slideEvent) {
                filterResults.rent.min = slideEvent.value[0];
                filterResults.rent.max = slideEvent.value[1];
                commands.filterSelection();
            },

            // filter function!
            filterSelection: function () {
                $.each(plans, function (key, value) {
                    var card = $('.card:eq(' + key + ')');
                    if (
                        (value.type[0] == filterResults.bed || filterResults.bed < 0 ) &&
                        (value.type[1] == filterResults.bath || filterResults.bath < 0 ) &&
                        (filterResults.rent.min <= Number(value.price.usd.replace(',', ''))) &&
                        (Number(value.price.usd.replace(',', '')) <= filterResults.rent.max)
                    ) {
                        card.show();
                    } else {
                        card.hide();
                    }
                });
            }
        }; // end of commands var

        // active slider:
        rent = $('#rent').slider({
            min: 500,
            max: 4000,
            range: true,
            value: [500, 4000],
            handle: 'custom'
        }).on("slide", commands.rentFilter);

        // inactive slider:
        sqft = $('#sqft').slider({
            min: 200,
            max: 7250,
            range: true,
            value: [200, 7250],
            handle: 'custom'
        }); // add .on method when ready to activate this slider


        expandFooter.on('click', commands.expandFooter);
        collapseFooter.on('click', commands.collapseFooter);
        expandAmenities.on('click', commands.expandAmenities);
        collapseAmenities.on('click', commands.collapseAmenities);
        bedrooms.find('button').each(commands.selectBedrooms);
        baths.find('button').each(commands.selectBaths);
        resetall.on('click', commands.reset);
        cancel.on('click', commands.collapseFooter);
        btnApplyFilter.on('click', commands.filterSelection)

    } // end of init function

    /** This function creates a prototype of a Card element that can be simply filled out
    @returns {{card: *,
        item: *,
        title: *,
        name: *,
        figure: (*|HTMLElement), image: (*|HTMLElement), caption: (*|HTMLElement),
        pre: *, price: *, post: *,
        more: *, note: *,
        button: *}}
     */
    function _makeCard() {
        var card = $('<div/>').addClass('col-xs-12  col-md-6 col-lg-4 card'),
            item = $('<div/>').addClass('item'),
            title = $('<h1/>').addClass('title'),
            name = $('<h2/>').addClass('name'),
            figure = $('<figure/>'),
            image = $('<img/>'),
            caption = $('<figcaption/>'),
            pre = $('<span/>').addClass('pre'), // 'Starting at'
            price = $('<span/>').addClass('price'),
            post = $('<span/>').addClass('post'), // ' /month'
            more = $('<div/>').addClass('more'),
            note = $('<div/>').addClass('notes'),
            button = $('<button/>').addClass('btn btn-default').text('View Details');
        card.append(item);
        item.append([title, name, figure]);
        figure.append([image, caption, more]);
        more.append([note, button]);
        caption.append([pre, price, post]);
        return {
            card: card,
            item: item,
            title: title,
            name: name,
            figure: figure,
            image: image,
            caption: caption,
            pre: pre,
            price: price,
            post: post,
            more: more,
            note: note,
            button: button
        };

    } // end of _makeCard function

    /**
     * Converts plans.type value to Bad/Bath number for our Cards
     * Used later in loadData()
     * @param t is an array of Bed and Bath number
     * @returns a string
     */
    function typeToString(t) {

        if (t[0] == 0) {
            return "Studio"
        } else {
            return t[0] + " Bed - " + t[1] + " Bath"
        }
    }

    // Loads availabilities from JSON to create View:
    function loadData() {
        // loops through each plans.js object:
        $.each(plans, function (key, cardData) {

            // first creates html card for each plans.js objects
            var CARD = _makeCard();
            // personalizes each card:
            CARD.title.text(typeToString(cardData.type) + ' | ' + cardData.size);
            CARD.name.text(cardData.name);
            CARD.image.attr({src: cardData.image});
            CARD.pre.text(cardData.price.pre);
            CARD.price.text('$' + cardData.price.usd);
            CARD.post.text(cardData.price.post);
            CARD.note.text(cardData.note);
            // add the 'specials' banner:
            if (cardData.specials) CARD.item.addClass('special');
            cards.append(CARD.card);

        })
    }

    $(document).ready(init);
})(jQuery);

// resulting html card for reference:
// <div class="col-xs-12  col-md-6 col-lg-4 card special">
//     <div class="item special">
//         <h1 class="title">Studio | 850 sqft</h1>
//         <h2 class="name">casa Nova</h2>
//         <figure>
//             <img src="images/casa-nova.jpg" alt="">
//             <figcaption>
//                 <span class="pre">Starting at</span>
//                 <span class="price">$1,200.00</span>
//                 <span class="post">/month</span>
//             </figcaption>
//         </figure>
//         <div class="more">
//             <div class="notes">Inquire for details</div>
//             <button class="btn btn-default">View Details</button>
//         </div>
//     </div>
//  </div>