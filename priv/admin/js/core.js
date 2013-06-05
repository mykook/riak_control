minispade.register('core', function() {

  /**
   * @class
   *
   * Node models a Riak Node participating in a cluster.
   */
  RiakControl.Node = DS.Model.extend(
    /** @scope RiakControl.Node.prototype */ {

    /**
     * Use the node name and ip address as the
     * unique identifier for the node.
     */
    primaryKey: 'name',

    name: DS.attr("string"),
    status: DS.attr("string"),
    reachable: DS.attr("boolean"),

    ring_pct: DS.attr("number"),
    pending_pct: DS.attr("number"),

    mem_total: DS.attr("number"),
    mem_used: DS.attr("number"),
    mem_erlang: DS.attr("number"),
    low_mem: DS.attr("boolean"),

    /**
     * This boolean attribute determines if the node
     * responsible for the API requests is running
     * Riak Control.
     */
    me: DS.attr("boolean"),

    /**
     * Whether this node is currently the claimant or not.
     */
    claimant: DS.attr("boolean")
  });

  /**
   * @class
   *
   * Partition represents one of the partitions in the
   * consistent hashing ring owned by the cluster.
   */
  RiakControl.Partition = DS.Model.extend(
    /** @scope RiakControl.Partition.prototype */ {

    /**
     * Use the index into the ring as the primary key and
     * unique identifier for this particular partition.
     */
    primaryKey: 'index',

    /* Partition index. */
    index: DS.attr("string"),

    /* Cluster n_val. */
    n_val: DS.attr("number"),

    /* Number of reachable/available primaries. */
    available: DS.attr("number"),

    /* Cluster quorum value. */
    quorum: DS.attr("number"),

    /* Whether all primaries are on distinct nodes. */
    distinct: DS.attr("boolean"),

    /* Whether or not all primaries are down or not. */
    allPrimariesDown: function() {
      return 0 === this.get('available');
    }.property('available'),

    /* Whether or not a quorum of primaries are down. */
    quorumUnavailable: function() {
      return this.get('available') < this.get('quorum');
    }.property('quorum', 'available')
  });

});
