const listingModel = require("./listings.model");

const createListing = async (req, res) => {
  try {
    const listing = await listingModel.create({
      ...req.body,
      seller: req.user._id,
    });
    return res.status(201).json({ message: "Listing Created" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllListings = async (req, res) => {
  try {
    const listings = await listingModel.find({ status: "live" });
    res.status(200).json({ listings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getListing = async (req, res) => {
  try {
    const listing = await listingModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    );
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.status(200).json({ listing });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await listingModel.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.seller.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this listing" });
    await listing.deleteOne();
    res.status(200).json({ message: "Listing deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateListing = async (req, res) => {
  try {
    const listing = await listingModel.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedListing = await listingModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res
      .status(200)
      .json({ message: "Listing updated", listing: updatedListing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createListing,
  getAllListings,
  getListing,
  deleteListing,
  updateListing,
};
