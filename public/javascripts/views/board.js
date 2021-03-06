var BoardView = Backbone.View.extend({
  template: App.templates.board,
  el: App.$main.get(0),
  events: {
    "click .add-list.idle": "openAddList",
    "click .add-list .cancel-edit": "closeAddList",
    "submit .add-list form": "addList"
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.renderLists();
    this.sortable();
    this.delegateEvents();
  },
  renderLists: function() {
    var self = this;
    var modelView;

    this.model.lists.each(function(model) {
      modelView = new ListView({
        model: model,
        collection: model.cards
      });
      self.$('#lists').append(modelView.el);
    });
  },
  sortable: function() {
    this.$('#lists').sortable({
      items: '.list-wrapper',
      placeholder: "ui-sortable-placeholder-list",
      forcePlaceholderSize: true,
      tolerance: 'pointer',
      axis: 'x',  
      start: function(event, ui) {
        ui.placeholder.height(ui.item.find('.list').height());
      },              
      update: function(event, ui) {
        var index = ui.item.index();
        var listID = ui.item.find('.list').data('id');

        App.trigger('updateListPosition', index, listID);
      }
    });
  },
  openAddList: function(e) {
    e.preventDefault();

    var $e = $(e.currentTarget);
    
    $e.removeClass('idle').find('.list-name-input').focus();
  },
  closeAddList: function(e) {
    e.preventDefault();
    e.stopPropagation();

    $(e.currentTarget).closest('.add-list').addClass('idle');
  },
  addList: function(e) {
    e.preventDefault();

    var $f = this.$('#listForm');
    var listName = $f.find('.list-name-input').val().trim();
    
    if (listName.length === 0) return false;

    this.sendAJAX($f);
  },
  sendAJAX: function($f) {
    var self = this;

    $.ajax({
      url: $f.attr('action'),
      type: $f.attr('method'),
      data: $f.serialize(),
      success: function(json) {
        self.collection.add(json);
      }
    });
  },
  initialize: function(options) {
    this.render();
    this.listenTo(this.collection, 'add remove reset update', this.render.bind(this));
  }
});