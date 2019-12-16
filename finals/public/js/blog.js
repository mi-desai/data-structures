$(function() {
    $(document).ready(function() {
        $('select').change(function() {
        buildQuery();
        });
        
     function buildQuery(){
    let parameters = {category: $('select[name="assignment"]').val()};
    console.log(parameters);
    getData(parameters).then(renderPage);
     }
    
    function getData(query) {
            return new Promise((resolve, reject) => {
                $.post({
                    url: '/getBlog',
                    data: query,
                    success: (result) => {
                        resolve(result);
                    }
                });
            });
        }
    
    function renderPage(results) {
        console.log(results);
        let elements = results[0];
        elements.coding.BOOL = "Coding Assignment";
        elements.reading.BOOL = "Reading Assignment";
        $('.Subject').text("Class: " + elements.Category.S).show();
        $('.Assignment').text("Assignment: " + elements.Assignment.S).show();
        $('.Language').text("Languages Used: " + elements.language.S).show();
        $('.Description').text("My Take: " + elements.description.S).show();
    }
    });
});