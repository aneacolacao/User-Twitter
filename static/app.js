$( document ).ready(function() {
    console.log( "ready!" );
});

var primero = {};


function fblogin() {
	console.log('Quieres iniciar sesion');
	FB.login(function(response) {
	   statusChangeCallback(response);
	},{scope: 'public_profile,email,user_photos,user_posts'});
}




//Load albums of user
function fbupload(){
	console.log('Abriste los albumes');
	FB.api(
	  '/me',
	  'GET',
	  {"fields":"albums.limit(999)"},
	  function(response) {
	  	console.log(response);
	  	var albums = response.albums.data;
	  	// var minimo = new Date(Math.max.apply(Math, albums.map(function(item){
	  	// 	console.log(new Date(item.created_time));
	  	// 	return item.created_time;})));
	  	// console.log(minimo);
	  	albums.sort(function(a, b) {
	  		return parseFloat(a.id) - parseFloat(b.id);
	  	});
	  	console.log(albums);
	  	console.log(albums[0]);
	  	var date_inicio = albums[0].created_time;
	  	getfirstpost(date_inicio);

	});
}

//Donde se van a guardar los posteos
var posteos;

//Load last post
function getfirstpost(){
	console.log('voy por el post ahora si');

	//Se crea DESDE - inicio FB - (28/02/2004)
	var id_date = new Date("February 28, 2004 00:00:00");
	var desde = Date.parse(id_date) / 1000;
    console.log('busco desde:');
    console.log(id_date);

	var h_date = id_date;

    //Se crea HASTA - inicio FB + 1 año - (28/02/2005)
	h_date.setFullYear(h_date.getFullYear()+1);
	hasta = Date.parse(h_date) / 1000;
	console.log('busco hasta:');
	console.log(h_date);

    //URL de la primera búsqueda con la API
	var url = "/me/feed?limit=250&since="+desde+"&until="+hasta;

    var d_date, h_date, d_month, h_month, hasta_m, desde_m, d_unix_date, po, respuesta, mensajes_p, desde_mmm, fbid, me;

    //Voy a obtener el ID
	FB.api(
		  "/me",
		  'GET',
		  {"fields":"id, name"},
		  function(response) {
		    console.log(response);
		    me = response;
            fbid = response.id;
            console.log(fbid);
		  }
    );

    //Dictamina si la búsqueda es mensual o no
    var monthly = false;

    //Dictamina que no hay mensaje
    var msje = false;

    //Dictamina que no hay posteos - no hay posteo a mostrar
    var posteos = {};

    //Busca los posteos DESDE - HASTA (02/2004-02/2005)
	var posteo = function(i){
		FB.api(
		  url,
		  'GET',
		  {"fields":"message, object_id, picture, link, permalink_url, from, status_type, created_time"},
		  function(response) {
		  	if(response.data.length > 0){ //Si la API arroja mínimo 1 resultado
		  		console.log('si hay respuesta');
		  		console.log('la ronda de posteo fue:' + i);
		  //		console.log(JSON.stringify(response));
		  		console.log(primero);
		  		if(response.data.length >= 250){
                    console.log('hay 250 posts');
                    if(monthly){ //Como fue 250, buscaremos si están faltando posteos entre el DESDE y el último valor de la "response"
                        var month_resp = response.data;
                        var maximo = month_resp.length-1;
                        console.log(maximo);
                        hasta_ult = month_resp[maximo].created_time; //Obtiene la fecha del último valor del RESPONSE
                        console.log(hasta_ult);

                        console.log('la ronda de posteo es:' + i);

                        //Asigna el desde
                        console.log('buscaré desde:');
                        console.log(d_month);

                        //Asigna el hasta
        			    h_month = new Date(hasta_ult); //
        			    hasta_m = Date.parse(h_month) / 1000;
                        console.log('buscaré hasta:');
                        console.log(h_month);

                        //Le asignas a la URL los nuevos valores de las fechas
                        url = "/me/feed?limit=250&since="+desde_m+"&until="+hasta_m;

                        posteo(i+1);
                    } else{

                        monthly = true; //convierto las búsquedas de la API en mensuales
    		  		    console.log(monthly);

                        console.log(d_date);

                        //Asigna el desde
                        d_month = new Date(d_date); //D_MONTH adquiere el valor del último DESDE (por ejemplo feb/2009)
                        console.log('buscaré desde:');
                        console.log(d_month);
                        desde_m = Date.parse(d_month) / 1000;

    		  		    h_month = new Date(d_month); //HASTA_M copia a D_MONTH (feb/2009)
    		  		    h_month.setMonth(h_month.getMonth()+1);  //Le suma un mes, para buscar desde un MES más desde el DESDE (mar/2009)
    		  		    hasta_m = Date.parse(h_month) / 1000;
                        console.log('buscaré hasta:');
                        console.log(h_month);

                        //Le asignas a la URL los nuevos valores de las fechas
                        url = "/me/feed?limit=250&since="+desde_m+"&until="+hasta_m;

                        posteo(i+1);
                    }
		  		}
		  		else{
    		  		console.log('hay menos de 250, aquí vienen los posts');

            // 		console.log(JSON.stringify(response));
            		//console.log(response);

            		respuesta = response.data;
            // 		posteos.sort(function(a,b){
            // 		   return parseFloat(a.created_time) - parseFloat(b.created_time);
            // 		}).reverse();
                    respuesta.reverse();
                    // console.log(JSON.stringify(posteos));

                    console.log(fbid);

                    //Obtiene los mensajes de foto, video o publicación
                    var posteos_me=$(respuesta).filter(function (i,n){
                        // n.status_type==='mobile_status_update' || n.status_type==='added_photos' || n.status_type==='added_video') &&

                        return ( n.from.id === fbid );
                        //  && n.message.length >= 1
                    });

                    var posteos_s = $(posteos_me).filter(function(a, s){
                       return ( s.status_type==='mobile_status_update' || s.status_type==='added_photos' || s.status_type==='added_video');
                    });
                    console.log(posteos_s);
                    console.log(JSON.stringify(posteos_s));

                    posteos=$(posteos_s).filter(function (m,l){
                        return ( l.hasOwnProperty('message'));
                    });
                    console.log('por que chingados se salta esta funcion?');
                    // console.log(JSON.stringify(posteos_status));

                    // posteos=$(posteos_status).filter(function (i,n){return n.message.length >= 1});
                    console.log(JSON.stringify(posteos));
                    console.log('estos son los posteos útiles: ' + posteos.length);
                    if (posteos.length == 0){ //si no hay posteos útiles (foto, video, publicación)
                        if(monthly){
                            console.log('soy mensual');
                            console.log('no hay respuesta útil (video, foto, publicación)');
    		  		        console.log('la ronda de posteo es:' + i);
                            console.log(h_month);

                            //Asigna el desde
                            d_month = new Date(h_month); //D_MONTH adquiere el valor del último HASTA (por ejemplo mar/2009)
                            console.log('buscaré desde:');
                            console.log(d_month);
                            desde_m = Date.parse(d_month) / 1000;

        		  		    h_month = new Date(d_month); //H_MONTH copia a D_MONTH (mar/2009)
        		  		    h_month.setMonth(h_month.getMonth()+1);  //Le suma un mes, para buscar un MES más que el DESDE (abr/2009)
        		  		    hasta_m = Date.parse(h_month) / 1000;
                            console.log('buscaré hasta:');
                            console.log(h_month);

                            //Le asignas a la URL los nuevos valores de las fechas
                            url = "/me/feed?limit=250&since="+desde_m+"&until="+hasta_m;

                            posteo(i+1);
                        } else{
                            console.log('soy anual');
                            console.log('no hay posteos útiles en este año');
            		  		console.log('la ronda de posteo es:' + i);

            		  		//Sirve para las siguientes búsquedas
            		  		d_date = new Date(h_date);
                            console.log(d_date);

            		  		desde = hasta; //convierto el HASTA UNIX a DESDE (el desde nuevo es 2005)

                            //Vuelvo el DESDE con la fecha del anterior HASTA
            		  		console.log('buscaré desde:');
            		  		console.log(h_date); //es la fecha HASTA anterior, la volví DESDE
                            console.log(d_date);

            		  		//Le sumo un año a HASTA
            		  		h_date.setFullYear(h_date.getFullYear()+1);
            		  		console.log('buscaré hasta:');
            				console.log(h_date) //es el año de la anterior búsqueda +1 (es decir 2006);
            				hasta = Date.parse(h_date) / 1000;

                            console.log(d_date);
                            //Le asignas a la URL los nuevos valores de las fechas
            				url = "/me/feed?limit=250&since="+desde+"&until="+hasta;

            				posteo(i+1); //haces una nueva búsqueda en la API
                        }

                    } else{
                        primero['message']=posteos[0].message;
                        primero['link']=posteos[0].permalink_url;
                        console.log(primero);
                        $.ajax({
            			    url: $SCRIPT_ROOT + "/post",
            			    type: "POST",
            			    data: JSON.stringify(primero),
            			    contentType: "application/json",
            			    success: function(dat) {
            			    	console.log('logré exportar el primero');
            			    	// window.location.href = "http://localhost:5000/post";
            			    	console.log(dat);
            			    	window.location.href = $SCRIPT_ROOT + "/post";
            			    },
            			    error: function (err){
            			    	console.log(err);
            			    }
            			});
                        // po = 0;
                        // f(po);
                    }

		 		}
		  	} else{
		  	    if(monthly){
                    console.log('soy mensual');
                    console.log('no hay respuesta en este mes');
    		  		console.log('la ronda de posteo es:' + i);
                    console.log(h_month);

                    //Asigna el desde
                    d_month = new Date(h_month); //D_MONTH adquiere el valor del último HASTA (por ejemplo mar/2009)
                    console.log('buscaré desde:');
                    console.log(d_month);
                    desde_m = Date.parse(d_month) / 1000;

    	  		    h_month = new Date(d_month); //H_MONTH copia a D_MONTH (mar/2009)
    	  		    h_month.setMonth(h_month.getMonth()+1);  //Le suma un mes, para buscar un MES más que el DESDE (abr/2009)
    	  		    hasta_m = Date.parse(h_month) / 1000;
                    console.log('buscaré hasta:');
                    console.log(h_month);

                    console.log(d_month);

                    //Le asignas a la URL los nuevos valores de las fechas
                    url = "/me/feed?limit=250&since="+desde_m+"&until="+hasta_m;

                    posteo(i+1);
		  	    }else{ //Si la API arroja NINGÚN resultado
    		  	   // console.log(JSON.stringify(response));
    		  		console.log('no hay respuesta');
    		  		console.log('la ronda de posteo es:' + i);

    		  		//Sirve para las siguientes búsquedas
    		  		d_date = new Date(h_date);
                    console.log(d_date);

    		  		desde = hasta; //convierto el HASTA UNIX a DESDE (el desde nuevo es 2005)

                    //Vuelvo el DESDE con la fecha del anterior HASTA
    		  		console.log('buscaré desde:');
    		  		console.log(h_date); //es la fecha HASTA anterior, la volví DESDE
                    console.log(d_date);

    		  		//Le sumo un año a HASTA
    		  		h_date.setFullYear(h_date.getFullYear()+1);
    		  		console.log('buscaré hasta:');
    				console.log(h_date) //es el año de la anterior búsqueda +1 (es decir 2006);
    				hasta = Date.parse(h_date) / 1000;

                    console.log(d_date);
                    //Le asignas a la URL los nuevos valores de las fechas
    				url = "/me/feed?limit=250&since="+desde+"&until="+hasta;

    				posteo(i+1); //haces una nueva búsqueda en la API
		  	    }
		  	}

		});
	}

	//Activa por primera vez la búsqueda (Feb 2004 a Feb 2005)
	posteo(0);

	function f(i){
        console.log(i);
    	if (i >= posteos.length){
    	    previous_url=respuesta.paging.previous;
    	    console.log(previous_url);
    	    $.getJSON(previous_url, function(data) {
                //data is the JSON
                console.log(data);
                // console.log(JSON.stringify(data));
        		respuesta = data;
        		posteos = data.data;
        		posteos.reverse();
        // 		console.log(JSON.stringify(posteos));
                po = 0;
                f(po);
            });
    	    return false;
    	}else{
        	console.log(posteos[i].id);
        	getPostData(posteos[i].id, if_mensaje);
    	}
    }

    function if_mensaje(mensaje){
        if(mensaje){
            console.log(mensaje);
        	console.log('este es el mensaje más viejo: ', mensaje[0].message);
        	primero['message']=mensaje[0].message;
        	primero['link_post']=mensaje[0].link;
        	primero['from']=mensaje[0].from;
        	primero['status']=mensaje[0].status_type;
        	primero['name']=mensaje[0].name;
        	console.log('guardé mensaje en array');
        	console.log(mensaje[0].imagen);
        	getImage(mensaje[0].imagen);
        	return true;
        } else{
        	console.log('no hay mensaje en este postx2');
            po+=1;
            console.log(po);
            f(po);
        	return false;
        }
    }
}



function getPostData(id, callback){
	FB.api(
	    "/"+id,
	    'GET',
		{"fields":"message, object_id, picture, link, permalink_url, from, status_type"},
	    function (response) {
			console.log(response);
// 			console.log(JSON.stringify(response));
    		if(response.status_type == 'mobile_status_update' || response.status_type == 'added_video'){
    			if (response.message) {
    				var mensaje = new Array();
    				console.log(response.message);
    				console.log(response.object_id);
    				console.log(response.permalink_url);
    				mensaje.push({"message":response.message,"imagen":response.object_id,"link":response.permalink_url,"name":response.name,"from":response.from,"status":response.status_type});
    				callback(mensaje);
    				return true;
    	        } else{
    	            console.log('no hay mensaje en este post');
    	        	callback(false);
    	        	return false;
    	        }
	        } else{
	            console.log('este post no es útil');
    	        callback(false);
    	        return false;
	        }
	    }
	);
}

function getImage(img){
	FB.api(
		  "/"+img,
		  'GET',
		  {"fields":"link,picture"},
		  function(response) {
		  	console.log(response.link);
		  	console.log(response.picture);
		  	primero['link']=response.link;
		  	primero['image']=response.picture;
		  	console.log(primero);
		  	console.log(primero.length);
		  //	console.log(JSON.stringify(primero));


		  	$.ajax({
			    url: $SCRIPT_ROOT + "/post",
			    type: "POST",
			    data: JSON.stringify(primero),
			    contentType: "application/json",
			    success: function(dat) {
			    	console.log('logré exportar el primero');
			    	// window.location.href = "http://localhost:5000/post";
			    	console.log(dat);
			    	window.location.href = $SCRIPT_ROOT + "/post";
			    },
			    error: function (err){
			    	console.log(err);
			    }
			});

		  });
}

