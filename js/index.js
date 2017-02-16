/**
 * ROUTING
 *
 */
//default route
var defaultRoute = 'home',
    active = defaultRoute;
//init portfolio
//navigate(defaultRoute);

// use history api to enable back / forward btns
window.addEventListener("popstate", function( ev ){
  //this will handle the back button and forward button if clicked.
  if(ev.state){
    navigate(ev.state.pageName);
  }else{
    navigate('home');
  }
  return false;
});

// handleing page refresh
window.onload = function(){
  var hash = window.location.hash;
  if(hash){
    navigate(hash.slice(1));
  }else{
    navigate(defaultRoute);
  }
};

function navigate(page){
  page = '.' + page;
  $('nav').removeClass('open');
  $(active).removeClass('in');
  $(page).addClass('in');
  active = page;
  //scroll back to top of page
  window.scrollTo(0, 0);
}

$('a').click(function(){
  var page = $(this).attr('data-page');

  //ensure its a routing link and not just regular href
  if($(this).attr('href') === '#'){
      navigate(page);
      //add to history stack
      addToHistory('#'+page);
      // hide project viewer
      $('.viewer').addClass('hidden');
      $('.projects-list').removeClass('hidden');
      clearProject();

      return false;
  }
});

// html5 history for back / forward button
function addToHistory(state, projectIndex){
  window.history.pushState({'pageName': state, 'projectIndex':projectIndex}, "", state);
}
/**
* MENU
*
*/
  $('.icon-menu').click(function(){
    $('nav').toggleClass('open');
  });
/**
 * WORKS
 *
 */
var pageHeight = window.innerHeight - 100,
    projects = [
      {
        name: "simplecom",
        hash: "aBaWMm",
        class: "simplecom"
      },
      {
        name: "mobile-tornado",
        hash: "aBaRve",
        class: "mbt"
      },
      {
        name: "audi-app",
        hash: "yVGzvv",
        class: "audi"
      },
      {
        name: "push-system",
        hash: "YNXRKP",
        class: "push"
      },
      {
        name: "micro-interactions",
        hash: "qRNozg",
        class: "micro"
      },{
        name: "weather-app",
        hash: "BLmLRV",
        class: "weather"
      },
    ];

projects.forEach(function(project, index, arr){
  // create project section and add to Dom
  $('<section>',{
    class: 'project ' + project.class
  }).appendTo('.projects-list')
  .click(function(){
    // hide projects list and show viewer
   toggleProjects();
    //load project
   displayProject(project.name);
    //add to history stack
   addToHistory('#works', index);
   //scroll to top of page
   window.scrollTo(0, 0);
  });
});

//displays a project
function displayProject(projectName){
  // load project via ajax
  $('.wrapper').load('./projects/' + projectName + '.html');
   onYouTubeIframeAPIReady();
}
function clearProject(){
  $('.wrapper').children().remove();
}
//ctrls behaviour
//close
$('.icon-close').click(function(){
  // show projects and hide viewer
  toggleProjects();
  clearProject();
});

//next
$('.icon-arrow-right-circle').click(function(){
  //check what project to load
  var index = history.state.projectIndex,
      nextIndex = index < (projects.length - 1) ? index + 1 : 0,
      nextProject =  projects[nextIndex].name;
  //add to history stack
  addToHistory('#works', nextIndex);

  displayProject(nextProject);
});

//prev
$('.icon-arrow-left-circle').click(function(){
  //clear old iframes
  $('.wrapper iframe').remove();
  //check what project to load
  var index = history.state.projectIndex,
      nextIndex = index > 0 ? index - 1 : projects.length - 1,
      prevProject = projects[nextIndex].name;
  //add to history stack
  addToHistory('#works', nextIndex);

  displayProject(prevProject);
});

var toggleProjects = function(){
  //hide/show viewer and  projects
  $('.viewer, .projects-list').toggleClass('hidden');
};

$( document ).ready(function() {
/**
 * COVER VIDEO
 *
 */
    scaleVideoContainer();

    initBannerVideoSize('.video-container .poster img');
    initBannerVideoSize('.video-container .filter');
    initBannerVideoSize('.video-container video');

    $(window).on('resize', function() {
        scaleVideoContainer();
        scaleBannerVideoSize('.video-container .poster img');
        scaleBannerVideoSize('.video-container .filter');
        scaleBannerVideoSize('.video-container video');
    });

  });

  function scaleVideoContainer() {

      var height = $(window).height() + 5;
      var unitHeight = parseInt(height) + 'px';
      $('.homepage-hero-module').css('height', unitHeight);

  }

  function initBannerVideoSize(element){

      $(element).each(function(){
          $(this).data('height', $(this).height());
          $(this).data('width', $(this).width());
      });

      scaleBannerVideoSize(element);

  }

  function scaleBannerVideoSize(element){

      var windowWidth = $(window).width(),
      windowHeight = $(window).height() + 5,
      videoWidth,
      videoHeight;

      $(element).each(function(){
          var videoAspectRatio = $(this).data('height')/$(this).data('width');

          $(this).width(windowWidth);

          if(windowWidth < 1000){
              videoHeight = windowHeight;
              videoWidth = videoHeight / videoAspectRatio;
              $(this).css({'margin-top' : 0, 'margin-left' : -(videoWidth - windowWidth) / 2 + 'px'});

              $(this).width(videoWidth).height(videoHeight);
          }

          $('.homepage-hero-module .video-container video').addClass('fadeIn animated');

      });
  }
  /**
   * YT-VIDEO
   *
   */
  //   This code loads the IFrame Player API code asynchronously.
  var tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag.nextSibling);
    //    This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    var player;
    function onYouTubeIframeAPIReady() {
      $('.video').each(function(){
        var playerInfo = {},
            player = $(this);
        // create player
        playerInfo.id = player.attr('id');
        playerInfo.videoId = player.attr('data-videoID');
        var curplayer = createPlayer(playerInfo);
      });
    }

      function createPlayer(playerInfo) {
          return new YT.Player(playerInfo.id, {
            height: '1050',
            width: '1400',
            playerVars: { 'autoplay': 1, 'controls': 0, 'rel': 0, 'showinfo': 0, 'loop': 1},
            videoId: playerInfo.videoId,
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
      }

    //   The API will call this function when the video player is ready.
    function onPlayerReady(event) {
      event.target.playVideo();

    }

    //    The API calls this function when the player's state changes.
    //    The function replays video when reache to enf (state=0),
    function onPlayerStateChange(event) {
      if (event.data === 0) {
          event.target.playVideo();
      }
    }
