var ListView = Backbone.View.extend({
  template: App.templates.list,
  tagName: 'li',
  className: 'list-wrapper',
  $popUp: $('.pop-over'),
  events: {
    "click .open-card-composer": "openCardComposer",
    "click .cancel-edit": "closeCardComposer",
    "submit .list": "addCard",
    "click .js-editing-target": 'editTitle',
    "blur .list-title": "updateListTitle",
    "click .list-hamburger": "updatePopOver"
  },
  editTitle: function(e) {
    var $e = $(e.currentTarget);
    
    $e.addClass('is-hidden');
    $e.next().focus();
  },
  openCardComposer: function(e) {
    e.preventDefault();

    this.renderCardComposer(this.model.get('id'));
  },
  renderCardComposer: function(listID) {
    var $cardComposer = $('.list[data-id=' + listID + ']').find('.open-card-composer');

    $cardComposer.addClass('hide');
    $cardComposer.prev().removeClass('hide');
  },
  closeCardComposer: function(e) {
    e.preventDefault();

    var $e = $(e.currentTarget);
    
    $e.closest('.card-composer')
      .addClass('hide')
      .next()
      .removeClass('hide');
  },
  updatePopOver: function(e) {
    e.preventDefault();

    var $e = $(e.currentTarget);
    var elementHeight = 25;
    var offset = $e.offset();
    var top = offset.top + elementHeight;
    var left = offset.left;

    App.trigger('updatePopOver', this.model, top, left);
  },
  addCard: function(e) {
    e.preventDefault();

    var $e = $(e.currentTarget);
    var $f = this.$('.cardForm');
    var listID = $e.data('id');
    var cardName = $e.find('.new-card-title').val().trim();

    if (cardName.length === 0) return false;
    
    this.sendAJAX($f, cardName, listID);
  },
  sendAJAX: function($f, cardName, listID) {
    var self = this;

    $.ajax({
      url: $f.attr('action'),
      type: $f.attr('method'),
      data: {
        title: cardName
      },
      success: function(card) {
        self.collection.add(card);
        App.trigger('incrementCardID');
      }
    });
  },
  updateListTitle: function(e) {
    var $e = $(e.currentTarget);
    var listName = $e.val().trim();
    console.log(listName);
    if (listName === '') return false;
    
    $e.prev().removeClass('is-hidden');
    this.model.editTitle(listName);
  },
  sortable: function() {
    this.$('.cards').sortable({ 
      connectWith: '.cards',
      placeholder: "ui-sortable-placeholder",
      forcePlaceholderSize: true,
      start: function(event, ui) {
        ui.item.startListID = $(this).closest('.list').data('id');
        ui.item.cardID = $(this).find('.card').data('id');
      },
      receive: function(event, ui) {
        var oldListID = +ui.item.startListID;
        var newListID = +$(event.target).closest('.list').data('id');
        var cardID = +ui.item.cardID;
        var newPosition = ui.item.index();
    
        App.trigger('updateCardPosition', oldListID, newListID, cardID, newPosition);
      },
    });
  },
  render: function() {
    var self = this;
    var modelView;
    this.$el.html(this.template(this.model.toJSON()));

    this.collection.each(function(model) {
      modelView = new CardView({ model: model });
      self.$('.cards').append(modelView.el);
    });
    
    this.delegateEvents();
    this.sortable();
  },
  initialize: function() {
    this.render();
    this.listenTo(this.collection, 'add change update', this.render.bind(this));
    this.listenTo(this.model, 'change', this.render.bind(this));
    this.listenTo(this.model, 'addCard', this.renderCardComposer.bind(this));
  }
});