const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');

// Dialogflow actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const TELL_FACT = 'tell.fact';

// Dialogflow parameter names
const CATEGORY_ARGUMENT = 'fact-category';

// Dialogflow Contexts/lifespans
const FACTS_CONTEXT = 'choose_fact-followup';
const DEFAULT_LIFESPAN = 5;
const END_LIFESPAN = 0;

const FACT_TYPE = {
  FUN: 'fun',
  SCIENCE: 'science',
};

const FUN_FACTS = new Set([
  'All sloths actually have three toes, but the two-toed sloth has only two fingers. Poor guys!',
  'Sloths can move along the ground at just 2 m (6.5 ft) per minute! In the trees they are slightly quicker at 3 m (10 ft) per minute. I\'ve seen paint dry faster than that!',
  'The slow-movement and unique thick fur of the sloth make it a great habitat for other creatures such as moths, beetles, cockroaches, fungi, and algae. In fact, this green colored algae provides a camouflage so sloths can avoid predators. Did you see that sloth over there? Neither did I!',
  'Sloths can extend their tongues 10 to 12 inches out of their mouths. Wink, wink. Nudge, nudge.',
  'The sloth has very long, sharp, and strong claws that they use to hold on to tree branches. The claws are also their only natural defense against predators. Come at me bro!',
  'Sloths usually only leave the tree they live in to go to the toilet once a week on the ground. Imagine that!',
  'Two-toed sloths are nocturnal, being most active at night. While three-toed sloths are diurnal which means they are most active during the day.',
  'Sloths in captivity sleep from 15 to 20 hours per day, which can leave them very little time for social activities. Sloths in the wild, though, sleep about as much as humans.',
  'Sloths are clumsy on land but are great swimmers. I don\'t do well with water myself.',
  'Three-toed sloths can turn their heads almost 360 degrees.',
  'Sloths are the cutest animals in the world. Okay, that might not be a “fact” per se, but you know it’s true.',
  'The ancient Greeks had a goddess for sloth and laziness, “Aergia”.',
  'After around nine hours of sleep, the sloth still doesn\'t make an attempt at getting friendly with others. The closest a sloth gets to social time is sleeping in the same tree with another sloth. Dude, same.',
  'After they are born, the babies aren\'t in a hurry to leave their mother. They ride around clinging to their mother\'s belly for several weeks after birth. Even after they stop dangling from their mother, little sloths stay by their mother\'s side for up to four years. How cute.',
  'Its scientific name, Bradypus, is Greek for "slow feet," which makes sense since it is the world\'s slowest animal.',
  'Because sloths don’t have incisors, they trim down leaves by smacking their firm lips together.',
]);

const SCIENCE_FACTS = new Set([
  'Sloths are a medium-sized mammal. There are two types of sloth: the two-toed sloth and the three-toed sloth.',
  'Sloths are part of the order Pilosa so they are related to anteaters and armadillos.',
  'Sloths are tree-dwelling animals, they are found in the jungles of Central and South America.',
  'A sloth\'s body is usually 50 to 60 cm long. Skeletons of now extinct species of sloth suggest some varieties used to be as large as elephants.',
  'Sloths have a four-part stomach that very slowly digests the tough leaves they eat, it can sometimes take up to a month for them to digest a meal. Digesting this diet means a sloth has very little energy left to move around making it one of the slowest moving animals in the world.',
  'In the wild, sloths live on average 10 - 16 years and in captivity over 30 years.',
  'Sloths are solitary creatures who only gather to mate.',
  'Female sloths are normally pregnant for seven to 10 months and will only give birth to one baby.',
  'The two-toed and three-toed sloths are very similar in appearance, except that the two-toed sloths grow a bit bigger. Though they are similar in form and function, it’s thought that it may be a case of parallel evolution that has caused this as they aren’t actually very closely related.',
  'Sloths spend almost all of their time in the trees of rainforests and almost always they hang upside down. According to a study carried out by Swansea University, they are able to do this because their internal organs are fixed to the rib cage to stop them weighing down on their lungs.',
  'Sloth mating takes only 5 seconds.',
  'All mammals, except sloths and manatees, have the same number of neck vertebrae.',
  'Costa Rica has the world’s only Sloth orphanage.',
  'A few million years ago, there were aquatic sloths. Ancient ground sloths evolved denser bones, allowing them to dive into the water for seagrass.',
  'Though their ancestors lived in North America, modern sloths live in Central and South America, enjoying the tall trees found in rain and cloud forests.',
  'Courting starts when a female yells a mating scream to let the males in the area know she is ready to mate. Males will fight for her by hanging from branches by their feet and pawing at each other. The victor wins the prize of mating with the female.',
  'Baby sloths have a gestation of five to six months for some types sloths and as much as 11.5 months for others.',
  'The tough leaves in a sloth\'s diet are difficult to digest. Sloths have a four-part stomach that slowly digests the leaves with bacteria. It can take up to a month for a sloth to digest one meal.',
  'The pygmy three-toed sloth is on the IUCN Species Survival Commission\'s top 100 list of most threatened species. These tiny sloths can only be found on Escudo Island, which is found off the coast of Panama.',
  'On average, sloths travel 41 yards per day—less than half the length of a football field!',
  'Sloths maintain a low body temperature of about 30-34 degrees Celsius (86-93 degrees Fahrenheit) and move in and out of shade to regulate their body temperature.',
  'Though not all sloths are endangered, some of the six species are threatened by habitat loss. Deforestation in the tropical forests of South and Central America jeopardize the trees sloths rely on for food and shelter. Please help to protect our beloved sloths.',
]);

const SLOTH_IMAGES = [
  [
    'http://kids.nationalgeographic.com/content/dam/kids/photos/animals/Mammals/Q-Z/sloth-beach-upside-down.adapt.945.1.jpg',
    'Sloth 1'
  ],
  [
    'http://kids.nationalgeographic.com/content/dam/kids/photos/animals/Mammals/Q-Z/photoak-threetoedsloth.ngsversion.1465391618565.png',
    'Sloth 2'
  ],
  [
    'https://c402277.ssl.cf1.rackcdn.com/photos/6518/images/story_full_width/iStock_000011145477Large_mini_%281%29.jpg',
    'Sloth 3'
  ],
  [
    'https://i.ytimg.com/vi/DljStQsY80I/maxresdefault.jpg',
    'Sloth 4'
  ],
  [
    'https://metrouk2.files.wordpress.com/2016/10/ad_223315391.jpg',
    'Sloth 5'
  ],
  [
    'http://www.rd.com/wp-content/uploads/sites/2/2016/04/sloths-slide1SamTrull.jpg',
    'Sloth 6'
  ],
  [
    'https://media.mnn.com/assets/images/2015/02/sloth.jpg',
    'Sloth 7'
  ],
  [
    'https://cdn.theconversation.com/files/134262/width926/image-20160816-12998-tf916v.jpg',
    'Sloth 8'
  ],
  [
    'http://www.animalfactguide.com/wp-content/uploads/2015/09/sloth4_full.jpg',
    'Sloth 9'
  ],
  [
    'http://www.villaperezoso.com/wordpress/wp-content/uploads/2013/11/Sloth-1.jpg',
    'Sloth 10'
  ],
  [
    'https://lonelyplanetwpnews.imgix.net/2017/03/GettyImages-144862048-e1490356627807.jpg',
    'Sloth 11'
  ],
  [
    'http://animals.sandiegozoo.org/sites/default/files/2016-08/hero_two-toed_sloth_animals.jpg',
    'Sloth 12'
  ],
  [
    'https://gifts.worldwildlife.org/gift-center/Images/large-species-photo/large-Three-toed-Sloth-photo.jpg',
    'Sloth 13'
  ],
  [
    'https://s-media-cache-ak0.pinimg.com/736x/c8/71/b9/c871b917bec9a210fe1a06ecc0767abd--animal-makeup-three-toed-sloth.jpg',
    'Sloth 14'
  ],
  [
    'https://cdnimg.in/wp-content/uploads/2015/08/large-Three-toed-Sloth-photo.jpg',
    'Sloth 15'
  ],
  [
    'http://cf.ltkcdn.net/small-pets/images/std/204253-675x450-slothonarope.jpg',
    'Sloth 16'
  ],
  [
    'https://s-media-cache-ak0.pinimg.com/736x/31/5f/e7/315fe7e80036a49a4e7634eeefb667e8--the-sloth-baby-sloths.jpg',
    'Sloth 17'
  ],
  [
    'http://wonderopolis.org/wp-content/uploads/2017/04/Slothsdreamstime_xl_51606457.jpg',
    'Sloth 18'
  ],
  [
    'https://media.treehugger.com/assets/images/2016/07/sloth-3.jpg.662x0_q70_crop-scale.jpg',
    'Sloth 19'
  ],
  [
    'https://i.elitestatic.com/content/uploads/2017/05/08113235/sloth-sleepover.jpg',
    'Sloth 20'
  ],
];

const LINK_OUT_TEXT = 'Learn more';
const WIKI_LINK = 'https://en.wikipedia.org/wiki/Sloth';
const NEXT_FACT_DIRECTIVE = ' What kind of fact would you like to hear next?';
const CONFIRMATION_SUGGESTIONS = ['Fun fact!', 'Science fact!', 'I\'m done'];

const NO_INPUTS = [
  'I didn\'t hear that.',
  'If you\'re still there, say that again.',
  'We can stop here. See you soon.'
];

function getRandomImage(images) {
  let randomIndex = Math.floor(Math.random() * images.length);

  return images[randomIndex];
}

function getRandomFact(facts) {
  if (facts.size <= 0) {
    return null;
  }

  let randomIndex = (Math.random() * (facts.size - 1)).toFixed();
  let randomFactIndex = parseInt(randomIndex, 10);
  let counter = 0;
  let randomFact = '';

  for (let fact of facts.values()) {
    if (counter === randomFactIndex) {
      randomFact = fact;
      break;
    }
    counter++;
  }
  facts.delete(randomFact);

  return randomFact;
}

exports.factsAboutSloths = functions.https.onRequest((request, response) => {
  const app = new App({ request, response });
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  // Greet the user and direct them to next turn
  function unhandledDeepLinks(app) {
    if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
      app.ask(app.buildRichResponse()
        .addSimpleResponse(`Welcome to Facts about Sloths! I'd really rather not talk about ${app.getRawInput()}.` +
        `Wouldn't you rather talk about Sloths? I can tell you a fun fact or a science fact about sloths.` +
        `Which do you want to hear about?`).addSuggestions(['Fun', 'Science']));
    } else {
      app.ask(`Welcome to Facts about Sloths! I'd really rather not talk about ${app.getRawInput()}.` +
      `Wouldn't you rather talk about Sloths? I can tell you a fun fact or a science fact about sloths.` +
      `Which do you want to hear about?`, NO_INPUTS);
    }
  }

  // Say a fact
  function tellFact(app) {
    let funFacts = app.data.funFacts ? new Set(app.data.funFacts) : FUN_FACTS;
    let scienceFacts = app.data.scienceFacts ? new Set(app.data.scienceFacts) : SCIENCE_FACTS;

    if (funFacts.size === 0 && scienceFacts.size === 0) {
      app.tell('Actually it looks like you heard it all. Thanks for listening!');

      return;
    }

    let factCategory = app.getArgument(CATEGORY_ARGUMENT);

    if (factCategory === FACT_TYPE.FUN) {
      let fact = getRandomFact(funFacts);
      if (fact === null) {
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let suggestions = ['Science'];

          app.ask(app.buildRichResponse()
            .addSimpleResponse(noFactsLeft(app, factCategory, FACT_TYPE.SCIENCE))
            .addSuggestions(suggestions));
        } else {
          app.ask(noFactsLeft(app, factCategory, FACT_TYPE.SCIENCE), NO_INPUTS);
        }
        return;
      }

      let factPrefix = 'Sure, here\'s a fun fact. ';
      app.data.funFacts = Array.from(funFacts);

      if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        let image = getRandomImage(SLOTH_IMAGES);
        app.ask(app.buildRichResponse()
          .addSimpleResponse(factPrefix)
          .addBasicCard(app.buildBasicCard(fact)
            .addButton(LINK_OUT_TEXT, WIKI_LINK)
            .setImage(image[0], image[1]))
          .addSimpleResponse(NEXT_FACT_DIRECTIVE)
          .addSuggestions(CONFIRMATION_SUGGESTIONS));
      } else {
        app.ask(factPrefix + fact + NEXT_FACT_DIRECTIVE, NO_INPUTS);
      }
      return;

    } else if (factCategory === FACT_TYPE.SCIENCE) {
      let fact = getRandomFact(scienceFacts);

      if (fact === null) {
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let suggestions = ['Fun'];

          app.ask(app.buildRichResponse()
            .addSimpleResponse(noFactsLeft(app, factCategory, FACT_TYPE.FUN))
            .addSuggestions(suggestions));
        } else {
          app.ask(noFactsLeft(app, factCategory, FACT_TYPE.FUN), NO_INPUTS);
        }
        return;
      }

      let factPrefix = 'Okay, here\'s a science fact. ';
      app.data.scienceFacts = Array.from(scienceFacts);
      if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        let image = getRandomImage(SLOTH_IMAGES);
        app.ask(app.buildRichResponse()
          .addSimpleResponse(factPrefix)
          .addBasicCard(app.buildBasicCard(fact)
            .setImage(image[0], image[1])
            .addButton(LINK_OUT_TEXT, WIKI_LINK))
          .addSimpleResponse(NEXT_FACT_DIRECTIVE)
          .addSuggestions(CONFIRMATION_SUGGESTIONS));
      } else {
        app.ask(factPrefix + fact + NEXT_FACT_DIRECTIVE, NO_INPUTS);
      }
      return;

    } else {
      // Conversation repair is handled in Dialogflow, but this is a safeguard
      if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        app.ask(app.buildRichResponse()
          .addSimpleResponse(`Sorry, I didn't understand. ` +
          `I can tell you fun facts or science facts about sloths. ` +
          `Which one do you want to hear about?`)
          .addSuggestions(CONFIRMATION_SUGGESTIONS));
      } else {
        app.ask(`Sorry, I didn't understand. ` +
        `I can tell you fun facts or science facts about sloths. ` +
        `Which one do you want to hear about?`, NO_INPUTS);
      }
    }
  }

  // Say they've heard it all about this category
  function noFactsLeft(app, currentCategory, redirectCategory) {
    let parameters = {};

    parameters[CATEGORY_ARGUMENT] = redirectCategory;
    // Replace the outgoing facts context with different parameters
    app.setContext(FACTS_CONTEXT, DEFAULT_LIFESPAN, parameters);
    let response = `Looks like you've heard all there is to know about the ${currentCategory} facts of sloths. ` +
    `I could tell you about its ${redirectCategory} instead. So what would you like to hear about?`;

    return response;
  }

  let actionMap = new Map();
  actionMap.set(UNRECOGNIZED_DEEP_LINK, unhandledDeepLinks);
  actionMap.set(TELL_FACT, tellFact);

  app.handleRequest(actionMap);
});
