import React from "react";

const Services = () => {
  return (
    <section className="services" id="services">
      <div className="section-header">
        <h3>Our Services</h3>
        <h1>What We <span>Offer</span></h1>
        <p>
          From food delivery to catering and recipe inspiration, we bring flavor and convenience to your table.
        </p>
      </div>

      <div className="card-grid">
        <div className="service-card">
          <h2>Food Delivery</h2>
          <p>Fast and reliable delivery of your favorite meals.</p>
        </div>
        <div className="service-card">
          <h2>Catering</h2>
          <p>Delicious catering options for parties and events.</p>
        </div>
        <div className="service-card">
          <h2>Recipe Inspiration</h2>
          <p>Discover new recipes and cooking ideas every day.</p>
        </div>
      </div>
    </section>
  );
};

export default Services;
