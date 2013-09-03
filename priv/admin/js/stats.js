minispade.register('stats', function() {
  var id = 0;

  /**
   * @class
   */
  RiakControl.StatsView = Ember.View.extend(
    /** @scope RiakControl.StatsView.prototype */ {
    templateName: 'stats'
  });

  /**
   * @class
   *
   * StatsController is responsible for displaying graphs related
   * to cluster statistics.
   */
  RiakControl.StatsController = Ember.Controller.extend(
    /**
     * Shares properties with RiakControl.ClusterController
     */
    RiakControl.ClusterAndNodeControls,
    /** @scope RiakControl.NodesController.prototype */ {

    /**
     * Reloads the record array associated with this controller.
     *
     * @returns {void}
     */
    reload: function() {
      this.get('content').reload();
    }
  });

  /**
   * @class
   *
   * Content for the add graph dropdown menu.
   */
  RiakControl.AddGraphSelectView = Ember.Select.extend({
    content: [
      '-- Choose a Statistic --',
      'KV - cpu_avg1',
      'KV - cpu_avg5',
      'KV - cpu_avg15',
      'KV - cpu_nprocs',
      'KV - node_get_fsm_active',
      'KV - node_get_fsm_active_60s',
      'KV - node_get_fsm_in_rate',
      'KV - node_get_fsm_objsize_95',
      'KV - node_get_fsm_objsize_99',
      'KV - node_get_fsm_objsize_100',
      'KV - node_get_fsm_objsize_mean',
      'KV - node_get_fsm_objsize_median',
      'KV - node_get_fsm_out_rate',
      'KV - node_get_fsm_rejected',
      'KV - node_get_fsm_rejected_60s',
      'KV - node_get_fsm_rejected_total',
      'KV - node_get_fsm_siblings_95',
      'KV - node_get_fsm_siblings_99',
      'KV - node_get_fsm_siblings_100',
      'KV - node_get_fsm_siblings_mean',
      'KV - node_get_fsm_siblings_median',
      'KV - node_get_fsm_time_95',
      'KV - node_get_fsm_time_99',
      'KV - node_get_fsm_time_100',
      'KV - node_get_fsm_time_mean',
      'KV - node_get_fsm_time_median',
      'KV - node_gets',
      'KV - node_gets_total',
      'KV - node_put_fsm_active',
      'KV - node_put_fsm_active_60s',
      'KV - node_put_fsm_in_rate',
      'KV - node_put_fsm_out_rate',
      'KV - node_put_fsm_rejected',
      'KV - node_put_fsm_rejected_60s',
      'KV - node_put_fsm_rejected_total',
      'KV - node_put_fsm_time_95',
      'KV - node_put_fsm_time_99',
      'KV - node_put_fsm_time_100',
      'KV - node_put_fsm_time_mean',
      'KV - node_put_fsm_time_median',
      'KV - node_puts',
      'KV - node_puts_total'
    ]
  });

  /**
   * @class
   *
   * Time Series mixin.
   */
  RiakControl.TimeSeries = Ember.Object.extend(
    /** @scope RiakControl.TimeSeries.prototype */ {

    markerID: 0,
    areaSelector: '#graphs',
    duration: 500,
    title: 'statName',

    /**
     * Random data generator.
     */
    random: d3.random.normal(.5, .2),

    /**
     * X-axis range.
     */
    xMin: 1,
    xMax: 100,

    /**
     * Time series margins.
     */
    marginTop: 20,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 40,

    /**
     * Whether or not this object should be marked for cleanup.
     */
    kill: false,

    /**
     * Time series dimensions.
     */
    width: function () {
      return 960 - this.get('marginLeft') - this.get('marginRight');
    }.property('marginLeft', 'marginRight'),

    height: function () {
      return 300 - this.get('marginTop') - this.get('marginBottom');
    }.property('marginTop', 'marginBottom'),

    /**
     * Axes
     */
    xAxis: function () {
      return d3.scale.linear()
                     .domain([this.get('xMin'), this.get('xMax') - 2])
                     .range([0, this.get('width')]);
    }.property('xMin', 'xMax'),

    yAxis: function () {
      return d3.scale.linear()
                     .domain([0, 1])
                     .range([this.get('height'), 0]);
    }.property('height'),

    /**
     * For drawing a line on the graph.
     */
    line: function () {
      var that = this;
      return d3.svg.line()
                   .interpolate('basis')
                   .x(function(d, i) { return that.get('xAxis')(i); })
                   .y(function(d, i) { return that.get('yAxis')(d); });
    }.property('xAxis', 'yAxis'),

    /**
     * Initial data.
     */
    data: function () {
      return d3.range(this.get('xMax')).map(this.get('random'));
    }.property('xMax', 'random'),

    /**
     * Header controls.
     */
    heading: function () {
      var areaSelector = this.get('areaSelector'),
          id = this.get('markerID');

      $(areaSelector).append(
        '<h2 class="marker' + id + '">' + this.get('title') + '</h2>');
      return $(areaSelector).append(
        '<a class="remove-graph marker' + id + '">remove this graph</a>');
    }.property('areaSelector', 'markerID', 'title'),

    /**
     * The svg element
     */
    svg: function () {
      var id = this.get('markerID'),
          width = this.get('width'),
          height = this.get('height'),
          marginLeft = this.get('marginLeft'),
          marginTop = this.get('marginTop'),
          yAxis = this.get('yAxis'),
          svg;

      svg = d3.select(this.get('areaSelector'))
              .append("svg")
                .attr("class", "marker" + id)
                .attr("width",
                      width + marginLeft + this.get('marginRight'))
                .attr("height",
                     height + marginTop + this.get('marginBottom'))
              .append("g")
                .attr("transform", 
                      "translate(" + marginLeft + "," + marginTop + ")");

      svg .append("defs")
          .append("clipPath")
            .attr("id", "clip" + id)
          .append("rect")
            .attr("width", width)
            .attr("height", height);

      svg .append("g")
            .attr("class", "x axis xaxis" + id)
            .attr("transform", "translate(0," + yAxis(0) + ")")
            .call(d3.svg.axis().scale(this.get('xAxis')).orient("bottom"));
          
      svg .append("g")
            .attr("class", "y axis yaxis" + id)
            .call(d3.svg.axis().scale(yAxis).orient("left"));

      return svg;
    
    }.property('areaSelector', 'markerID',
               'width', 'height',
               'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
               'xAxis', 'yAxis'),

    /**
     * The path element.
     */
    path: function () {
      return this.get('svg')
        .append("g")
          .attr("clip-path", "url(#clip" + this.get('markerID') + ")")
        .append("path")
          .datum(this.get('data'))
          .attr("class", "line")
          .attr("d", this.get('line'));
    }.property('svg', 'markerID', 'data', 'line'),

    /**
     * Function for animating the graph
     */
    tick: function () {
      var newx,
          newXMin = this.get('xMin') + 1,
          newXMax = this.get('xMax') + 1,
          id = this.get('markerID'),
          data = this.get('data'),
          duration = this.get('duration'),
          that = this,
          recurse = function () {return that.tick.call(that)};

      // Make sure the graph hasn't been removed.
      var stillExists = $('.marker' + id).length;

      // If the graph hasn't been removed, redraw stuff.
      if (stillExists) {

        // push a new data point onto the back
        data.push(this.get('random')());

        // redraw the line, and slide it to the left
        this.get('path')
              .attr("d", this.get('line'))
              .attr("transform", null)
            .transition()
              .duration(duration)
              .ease("linear")
              .attr("transform", "translate(" + this.get('xAxis')(0) + ",0)")
              .each("end", function () { return recurse() });

        newx = d3.scale.linear()
                       .domain([newXMin, newXMax - 2])
                       .range([0, this.get('width')]);

        d3.select(".xaxis" + id)
          .transition()
          .duration(duration)
          .ease('linear')
          .call(d3.svg.axis().scale(newx).orient('bottom'));
       
        // pop the old data point off the front
        data.shift();
      }
    },

    /**
     * Describes how to remove this chart.
     */
    setupRemove: function () {
      var id = this.get('markerID'),
          that = this;

      /*
       * When we click the associated 'remove graph' button,
       * delete this jQuery event because it will no longer be
       * relevant, remove all DOM elements associated with this
       * object's id, and finally destroy the object.
       */
      $('.remove-graph.marker' + id).on('click', function (ev) {
        $('.remove-graph.marker' + id).off('click');
        $('.marker' + id).remove();
        that.set('kill', true);
      });
    },

    /**
     * Hack to actually draw the chart.
     */
    start: function () {
      this.get('width');
      this.get('height');
      this.get('xAxis');
      this.get('yAxis');
      this.get('line');
      this.get('data');
      this.get('heading');
      this.get('svg');
      this.get('path');
      this.get('tick').call(this);
      this.get('setupRemove').call(this);
    }
  });


  /**
   * An object for creating time series graphs.
   */
  RiakControl.StatGraphCreator = Ember.ArrayController.create({
    
    /**
     * Holds graph objects.
     */
    content: [],

    /**
     * Tracks the selected option in RiakControl.AddGraphSelectView.
     */
    selectedStat: '',

    /**
     * Function for creating a new graph.
     */
    createGraph: function () {

      /*
       * Get the stat name and clean stuff like "KV - " off the front of it.
       */
      var selected = this.get('selectedStat').replace(/^[^\s]+\s+\-\s+/, ''),
          graphObject;

      /*
       * If the selected item is not the default option...
       */
      if (selected !== '-- Choose a Statistic --') {
        
        /*
         * Create a new graph.
         */
        graphObject = RiakControl.TimeSeries.create({
          markerID: id += 1,
          title: selected
        });

        /*
         * Store the object in our array and
         * light it up.
         */
        this.pushObject(graphObject);
        graphObject.start();

        /*
         * Set the dropdown back to the default option.
         */
        $('#add-new-graph select').find('option:first')
                                  .attr('selected', 'selected');
      }
    }.observes('selectedStat'),

    /**
     * Whenever one of our objects gets `kill` set to true,
     * find that object in content, remove it, and destroy it.
     */
    destroyObj: function () {
      var toRemove;

      /*
       * Isolate the object to destroy.
       */
      this.get('content').map(function (obj) {
        if (obj.kill === true) {
          toRemove = obj;
        }
      });

      /*
       * If we found an object to destroy, remove it and destroy it.
       */
      if (toRemove) {
        this.removeObject(this.findProperty('markerID', toRemove.markerID));
        toRemove.destroy();
      }
    }.observes('content.@each.kill')
  });

});