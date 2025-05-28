/// <reference types="cypress" />

// If you are on MacOS and have many popups about Chromium when these tests run, please see: https://github.com/puppeteer/puppeteer/issues/4752

// ! these tests are run in go rooms because group rooms cost money to run
// ! so some tests are commented out

// Creates a random string like 'ft68eyjn8i'
const getRoomName = () => Math.random().toString(36).slice(2);

context('A video app user', () => {
  describe('joining a room', () => {
    it('joins the room', () => {
      // These tests were written before Gallery View was implemented. This app now activates
      // Gallery View by default, so here we activate Speaker View before visiting the app so
      // that the tests can pass.
      cy.visit('/', {
        onBeforeLoad: (window) => {
          window.localStorage.setItem('gallery-view-active-key', false);
        },
      });

      cy.get('#input-user-name').type('testuser');
      cy.get('#input-room-name').clear();
      cy.get('#input-room-name').type(getRoomName());
      cy.get('[type="submit"]').click();


      // the audio indicator test takes too long so it's commented out

      // When the 'y' attribute is 14, it means that the audio indicator icon is showing that there is no sound.
      // cy.get('clipPath rect').should(($rect) => {
      //   const y = $rect.attr('y');
      //   expect(Number(y)).to.equal(14);
      // });

      // When the 'y' attribute is less than 14, it means that the audio indicator icon is showing that there is sound.
      // Since the indicator should be moving up and down with the audible beeps, 'y' should be 14 and less than 14 at
      // different points of time. Cypress will continuously retry these assertions until they pass or timeout.
      // cy.get('clipPath rect').should(($rect) => {
      //   const y = $rect.attr('y');
      //   expect(Number(y)).to.be.lessThan(14);
      // });
    });
  });

  describe('when entering an empty room that one participant will join', () => {
    const ROOM_NAME = getRoomName();

    before(() => {
      cy.joinRoom('testuser', ROOM_NAME);

      cy.task('addParticipant', { name: 'test1', roomName: ROOM_NAME });

      // show all participants (the one that just joined)
      cy.get('[data-cy-show-all-arrow]').then(($el) => {
        const isShowingAll = $el.attr('data-cy-show-all-arrow') === 'true';
        if (!isShowingAll) {
          cy.wrap($el).click();
        }
      });
    });

    after(() => {
      cy.leaveRoom();
    });

    it('should be inside the correct room', () => {
      cy.get('footer').should('contain', ROOM_NAME);
      cy.getParticipant('testuser').should('contain', 'testuser');
    });

    it('should be able to see the other participant', () => {
      cy.get('[data-cy-main-participant]').should('contain', 'test1');
      cy.getParticipant('test1').should('contain', 'test1').shouldBeSameVideoAs('[data-cy-main-participant]');
    });

    it('should be able to hear the other participant', () => {
      cy.getParticipant('test1').shouldBeMakingSound();
    });

    // it('should see the participants audio level indicator moving', () => {
    //   // When the 'y' attribute is 14, it means that the audio indicator icon is showing that there is no sound.
    //   cy.getParticipant('test1')
    //     .get('clipPath rect')
    //     .should(($rect) => {
    //       const y = $rect.attr('y');
    //       expect(Number(y)).to.equal(14);
    //     });

    //   // When the 'y' attribute is less than 14, it means that the audio indicator icon is showing that there is sound.
    //   // Since the indicator should be moving up and down with the audible beeps, 'y' should be 14 and less than 14 at
    //   // different points of time. Cypress will continuously retry these assertions until they pass or timeout.
    //   cy.getParticipant('test1')
    //     .get('clipPath rect')
    //     .should(($rect) => {
    //       const y = $rect.attr('y');
    //       expect(Number(y)).to.be.lessThan(14);
    //     });
    // });

    it('should see other participants disconnect when they close their browser', () => {
      cy.task('participantCloseBrowser', 'test1');
      cy.getParticipant('test1').should('not.exist');
      cy.get('[data-cy-main-participant]').should('contain', 'testuser');
    });

    // ! can't record in go rooms

    // describe('the recording start/stop feature', () => {
    //   before(() => {
    //     cy.get('footer [data-cy-more-button]').click();
    //     cy.get('[data-cy-recording-button]').click();
    //     // eslint-disable-next-line cypress/no-unnecessary-waiting
    //     cy.wait(2000);
    //   });

    //   after(() => {
    //     // eslint-disable-next-line cypress/no-unnecessary-waiting
    //     cy.wait(3000);
    //   });

    //   it('should see the recording indicator and notification after clicking "Start Recording"', () => {
    //     cy.get('[data-cy-recording-indicator]').should('be.visible');
    //     cy.contains('Recording has started').should('be.visible');
    //     cy.get('footer [data-cy-more-button]').click();
    //     cy.get('[data-cy-recording-button]').click();
    //   });

    //   it('should see "Recording Complete" notification, and not the recording indicator after clicking "Stop Recording"', () => {
    //     cy.get('footer [data-cy-more-button]').click();
    //     cy.get('[data-cy-recording-button]').click();
    //     cy.get('[data-cy-recording-indicator]').should('not.exist');
    //     cy.contains('Recording Complete').should('be.visible');
    //   });
    // });
  });

  describe('when entering a room with one participant', () => {
    const ROOM_NAME = getRoomName();

    before(() => {
      cy.task('addParticipant', { name: 'test1', roomName: ROOM_NAME });
      cy.joinRoom('testuser', ROOM_NAME);

      cy.get('[data-cy-show-all-arrow]').then(($el) => {
        const isShowingAll = $el.attr('data-cy-show-all-arrow') === 'true';
        if (!isShowingAll) {
          cy.wrap($el).click();
        }
      });
    });

    after(() => {
      cy.leaveRoom();
    });

    it('should be able to see the other participant', () => {
      cy.get('[data-cy-main-participant]').should('contain', 'test1');
      cy.getParticipant('test1').should('contain', 'test1').shouldBeSameVideoAs('[data-cy-main-participant]');
    });

    it('should be able to hear the other participant', () => {
      cy.getParticipant('test1').shouldBeMakingSound();
    });

    describe('the chat feature', () => {
      // Before we test the chat feature, we want to open the chat window and send enough messages
      // to make the message list taller than its container so that we can test the scrolling behavior:
      before(() => {
        // there are two chat buttons (the mobile topbar has one but isn't visible)
        cy.get('[data-cy-chat-button]:visible').click();

        // Create an array with 15 values, then send a message when looping over each of them:
        Array(15)
          .fill(true)
          .forEach((_, i) => {
            cy.task('sendAMessage', {
              name: 'test1',
              message: 'welcome to the chat! - ' + i,
            });
          });
        // Wait 1 second for the above to complete:
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.contains('welcome to the chat! - 14');
      });

      after(() => {
        cy.get('[data-cy-chat-button]:visible').click();
      });

      it('should see "1 new message" button when not scrolled to bottom of chat and a new message is received', () => {
        cy.get('[data-cy-message-list-inner-scroll]').scrollTo(0, 0);
        cy.task('sendAMessage', { name: 'test1', message: 'how is it going?' });
        cy.contains('1 new message').should('be.visible');
      });

      const checkScrollToBottom = (selector, epsilon = 1) => {
        // Here we are checking if the chat window has scrolled all the way to the bottom.
        // The following will be true if the scrolling container's scrollHeight property
        // is equal to its 'scrollTop' plus its 'clientHeight' properties:

        cy.get(selector).should(($el) => {
          const scrollHeight = $el.prop('scrollHeight');
          const scrollTop = $el.prop('scrollTop');
          const clientHeight = $el.prop('clientHeight');

          // there are rounding errors when checking scroll
          const difference = Math.abs(scrollHeight - (scrollTop + clientHeight));
          expect(difference).to.be.lessThan(epsilon);
        });
      };

      it('should scroll to bottom of chat when "1 new message button" is clicked on', () => {
        cy.get('[data-cy-message-list-inner-scroll]').scrollTo(0, 0);
        cy.task('sendAMessage', { name: 'test1', message: 'Ahoy!' });
        cy.contains('Ahoy!');
        cy.get('[data-cy-new-message-button]').should('be.visible').click();
        cy.get('[data-cy-message-list-inner-scroll]').contains('Ahoy!').should('be.visible');
        checkScrollToBottom('[data-cy-message-list-inner-scroll]');
      });

      it('should not see "1 new message" button when manually scroll to bottom of chat after receiving new message', () => {
        cy.get('[data-cy-message-list-inner-scroll]').scrollTo(0, 0);
        cy.task('sendAMessage', { name: 'test1', message: 'chatting is fun!' });
        cy.get('[data-cy-new-message-button]').should('be.visible');
        cy.get('[data-cy-message-list-inner-scroll]').scrollTo('bottom');
        cy.get('[data-cy-new-message-button]').should('not.be.visible');
        cy.get('[data-cy-message-list-inner-scroll]').contains('chatting is fun!').should('be.visible');
      });

      it('should auto-scroll to bottom of chat when already scrolled to bottom and a new message is received', () => {
        cy.get('[data-cy-message-list-inner-scroll]').scrollTo('bottom');
        cy.task('sendAMessage', { name: 'test1', message: 'what a wonderful day!' });
        cy.contains('what a wonderful day!');
        checkScrollToBottom('[data-cy-message-list-inner-scroll]');
      });
    });
  });

  // ! go rooms only support two participants

  // describe('when entering an empty room that three participants will join', () => {
  //   const ROOM_NAME = getRoomName();

  //   before(() => {
  //     cy.joinRoom('testuser', ROOM_NAME);
  //     cy.task('addParticipant', { name: 'test1', roomName: ROOM_NAME, color: 'red' });
  //     cy.task('addParticipant', { name: 'test2', roomName: ROOM_NAME, color: 'blue' });
  //     cy.task('addParticipant', { name: 'test3', roomName: ROOM_NAME, color: 'green' });
  //   });

  //   after(() => {
  //     cy.leaveRoom();
  //   });

  //   it('should be able to see the other participants', () => {
  //     cy.getParticipant('test1').should('contain', 'test1').shouldBeColor('red');
  //     cy.getParticipant('test2').should('contain', 'test2').shouldBeColor('blue');
  //     cy.getParticipant('test3').should('contain', 'test3').shouldBeColor('green');
  //   });

  //   it('should be able to hear the other participants', () => {
  //     cy.getParticipant('test1').shouldBeMakingSound();
  //     cy.getParticipant('test2').shouldBeMakingSound();
  //     cy.getParticipant('test3').shouldBeMakingSound();
  //   });
  // });

  // describe('when entering a room with three participants', () => {
  //   const ROOM_NAME = getRoomName();

  //   before(() => {
  //     cy.task('addParticipant', { name: 'test1', roomName: ROOM_NAME, color: 'red' });
  //     cy.task('addParticipant', { name: 'test2', roomName: ROOM_NAME, color: 'blue' });
  //     cy.task('addParticipant', { name: 'test3', roomName: ROOM_NAME, color: 'green' });
  //     cy.joinRoom('testuser', ROOM_NAME);
  //   });

  //   after(() => {
  //     cy.leaveRoom();
  //   });

  //   it('should be able to see the other participants', () => {
  //     cy.getParticipant('test1').should('contain', 'test1').shouldBeColor('red');
  //     cy.getParticipant('test2').should('contain', 'test2').shouldBeColor('blue');
  //     cy.getParticipant('test3').should('contain', 'test3').shouldBeColor('green');
  //   });

  //   it('should be able to hear the other participants', () => {
  //     cy.getParticipant('test1').shouldBeMakingSound();
  //     cy.getParticipant('test2').shouldBeMakingSound();
  //     cy.getParticipant('test3').shouldBeMakingSound();
  //   });

  //   it('should see participant "test1" when they are the dominant speaker', () => {
  //     cy.task('toggleParticipantAudio', 'test2');
  //     cy.task('toggleParticipantAudio', 'test3');
  //     cy.getParticipant('test2').find('[data-test-audio-mute-icon]');
  //     cy.getParticipant('test3').find('[data-test-audio-mute-icon]');
  //     cy.getParticipant('test1').shouldBeSameVideoAs('[data-cy-main-participant]');
  //   });

  //   it('should see participant "test2" when they are the dominant speaker', () => {
  //     cy.task('toggleParticipantAudio', 'test1');
  //     cy.task('toggleParticipantAudio', 'test2');
  //     cy.getParticipant('test1').find('[data-test-audio-mute-icon]');
  //     cy.getParticipant('test3').find('[data-test-audio-mute-icon]');
  //     cy.getParticipant('test2').shouldBeSameVideoAs('[data-cy-main-participant]');
  //   });

  //   it('should see participant "test3" when they are the dominant speaker', () => {
  //     cy.task('toggleParticipantAudio', 'test2');
  //     cy.task('toggleParticipantAudio', 'test3');
  //     cy.getParticipant('test1').find('[data-test-audio-mute-icon]');
  //     cy.getParticipant('test2').find('[data-test-audio-mute-icon]');
  //     cy.getParticipant('test3').shouldBeSameVideoAs('[data-cy-main-participant]');
  //   });

  //   it('should see participant "test3" when there is no dominant speaker', () => {
  //     cy.task('toggleParticipantAudio', 'test3');
  //     cy.getParticipant('test1').find('[data-test-audio-mute-icon]');
  //     cy.getParticipant('test2').find('[data-test-audio-mute-icon]');
  //     cy.getParticipant('test3').find('[data-test-audio-mute-icon]');
  //     cy.getParticipant('test3').shouldBeSameVideoAs('[data-cy-main-participant]');
  //   });
  // });
});
