$( document ).ready(function() {
  
  $('#caixaAlerta > .alert').delay( 4000 ).slideUp( 400 );

  $('.trataClique').on('click', function(){
    var id = $(this).attr("data-id");
    $('#idExcluido').val(id);
  });
  
});