(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.PlateCatalog = api;
    }
})(typeof window !== "undefined" ? window : globalThis, function () {
    const PHOTO_STATUSES = Object.freeze({
        CURRENT: "current",
        MISSING: "missing",
        NEEDS_UPGRADE: "needs-upgrade",
    });

    const IMAGE_KINDS = Object.freeze({
        PLATE: "plate",
        EMBLEM: "emblem",
    });

    const STICKER_STYLES = Object.freeze(["black", "blue", "green", "red"]);
    const DEFAULT_STICKER_FOOT = "WASHINGTON";

    const categories = [
        {
            id: "collector_vehicles",
            title: "Collector Vehicles",
            sticker: { style: "green", mark: "CLV" },
            plates: [
                {
                    id: "collector-vehicle",
                    title: "Collector Vehicle",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "collector_vehicles/collector_vehicle.jpg",
                },
                {
                    id: "horseless-carriage",
                    title: "Horseless Carriage",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "collector_vehicles/horseless_carriage.jpg",
                },
                {
                    id: "restored",
                    title: "Restored",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "collector_vehicles/restored_82_delorean.jpg",
                },
            ],
        },
        {
            id: "colleges",
            title: "Colleges and Universities",
            sticker: { style: "blue", mark: "UNI" },
            plates: [
                {
                    id: "central-washington-university",
                    title: "Central Washington University",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "colleges/cwu.jpg",
                },
                {
                    id: "eastern-washington-university",
                    title: "Eastern Washington University",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "colleges/ewu.jpg",
                },
                {
                    id: "evergreen-state-college",
                    title: "Evergreen State College",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "colleges/esc_2.jpg",
                },
                {
                    id: "gonzaga-university",
                    title: "Gonzaga University",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "colleges/gonzaga.jpg",
                },
                {
                    id: "seattle-university",
                    title: "Seattle University",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "university-of-washington",
                    title: "University of Washington",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "colleges/uw.jpg",
                },
                {
                    id: "washington-state-university",
                    title: "Washington State University",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "colleges/wsu.jpg",
                },
                {
                    id: "western-washington-university",
                    title: "Western Washington University",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
            ],
        },
        {
            id: "first_responders",
            title: "First Responders",
            sticker: { style: "red", mark: "911" },
            plates: [
                {
                    id: "law-enforcement-memorial",
                    title: "Law Enforcement Memorial",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "first_responders/lem.jpg",
                },
                {
                    id: "professional-firefighter",
                    title: "Professional Firefighter",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "first_responders/pro_ff.jpg",
                },
                {
                    id: "volunteer-firefighter",
                    title: "Volunteer Firefighter",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "first_responders/vol_ff.jpg",
                },
            ],
        },
        {
            id: "mil",
            title: "Military and Veterans",
            sticker: { style: "green", mark: "MIL" },
            plates: [
                {
                    id: "988-prevent-veteran-suicide",
                    title: "988 - Prevent Veteran Suicide",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    imageKind: IMAGE_KINDS.EMBLEM,
                    asset: "mil/988.jpg",
                },
                {
                    id: "air-force",
                    title: "Air Force",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "mil/air_force.jpg",
                },
                {
                    id: "army",
                    title: "Army",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "mil/army.jpg",
                },
                {
                    id: "coast-guard",
                    title: "Coast Guard",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "mil/coast_guard.jpg",
                },
                {
                    id: "disabled-american-veteran",
                    title: "Disabled American Veteran",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "former-prisoner-of-war",
                    title: "Former Prisoner of War",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "gold-star",
                    title: "Gold Star",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "mil/gold_star.jpg",
                },
                {
                    id: "marine-corps",
                    title: "Marine Corps",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "mil/marine_corps.jpg",
                },
                {
                    id: "medal-of-honor",
                    title: "Medal of Honor",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "military-affiliate-radio-system",
                    title: "Military Affiliate Radio System (MARS)",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "national-guard",
                    title: "National Guard",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "mil/nat_guard_ribbon.jpg",
                },
                {
                    id: "navy",
                    title: "Navy",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "purple-heart",
                    title: "Purple Heart",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "mil/purple_heart_2.jpg",
                },
                {
                    id: "veteran-military-service-award-emblems",
                    title: "Veteran/Military Service Award emblems",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    imageKind: IMAGE_KINDS.EMBLEM,
                    asset: "mil/nat_guard_ribbon.jpg",
                },
            ],
        },
        {
            id: "orgs",
            title: "Organizations",
            sticker: { style: "black", mark: "ORG" },
            plates: [
                {
                    id: "4-h",
                    title: "4-H",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "breast-cancer",
                    title: "Breast Cancer",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "orgs/breast_cancer.jpg",
                },
                {
                    id: "ffa-foundation",
                    title: "FFA Foundation",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "fred-hutchinson-cancer-center",
                    title: "Fred Hutchinson Cancer Center",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "orgs/fred_hutch.jpg",
                },
                {
                    id: "helping-kids-speak",
                    title: "Helping Kids Speak (Freemason)",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "orgs/freemason.jpg",
                },
                {
                    id: "jp-patches-pal",
                    title: "J.P. Patches Pal",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "orgs/jp_patches.jpg",
                },
                {
                    id: "keep-kids-safe",
                    title: "Keep Kids Safe",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "orgs/kids_safe.jpg",
                },
                {
                    id: "washington-apple-commission",
                    title: "Washington Apple Commission",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "orgs/wac_apples_2.jpg",
                },
                {
                    id: "washington-wine-commission",
                    title: "Washington Wine Commission",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "orgs/wine_country.jpg",
                },
                {
                    id: "we-love-our-pets",
                    title: "We Love Our Pets",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "orgs/pets.jpg",
                },
            ],
        },
        {
            id: "parks",
            title: "Parks and Environment",
            sticker: { style: "green", mark: "PRK" },
            plates: [
                {
                    id: "endangered-wildlife-orca",
                    title: "Endangered Wildlife: Orca",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "parks/endangered_wildlife_orca.jpg",
                },
                {
                    id: "honeybees-and-pollinators",
                    title: "Honeybees and Pollinators",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "lighthouse",
                    title: "Lighthouse",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "parks/lighthouse.jpg",
                },
                {
                    id: "san-juan-islands",
                    title: "San Juan Islands",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "parks/san_juan.jpg",
                },
                {
                    id: "state-flower",
                    title: "State Flower",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "parks/rhodie.jpg",
                },
                {
                    id: "washington-national-parks",
                    title: "Washington National Parks",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "parks/natl_parks.jpg",
                },
                {
                    id: "washington-state-parks",
                    title: "Washington State Parks",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "parks/state_parks.jpg",
                },
                {
                    id: "washingtons-wildlife-bear",
                    title: "Washington's Wildlife: Bear",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "parks/wa_wildlife_bear.jpg",
                },
                {
                    id: "washingtons-wildlife-deer",
                    title: "Washington's Wildlife: Deer",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "parks/wa_wildlife_deer.jpg",
                },
                {
                    id: "washingtons-wildlife-elk",
                    title: "Washington's Wildlife: Elk",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "parks/wa_wildlife_elk.jpg",
                },
                {
                    id: "washingtons-wildlife-steelhead",
                    title: "Washington's Wildlife: Steelhead",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "parks/wa_wildlife_steelhead.jpg",
                },
                {
                    id: "wild-on-washington-eagle",
                    title: "Wild on Washington: Eagle",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "parks/wild_wa_eagle.jpg",
                },
            ],
        },
        {
            id: "special_interests",
            title: "Special Interests",
            sticker: { style: "blue", mark: "INT" },
            plates: [
                {
                    id: "amateur-radio-operator",
                    title: "Amateur Radio Operator (HAM)",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "fly-washington-aviation",
                    title: "Fly Washington Aviation",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "special_interests/fly_wa_aviation.jpg",
                },
                {
                    id: "keep-washington-evergreen",
                    title: "Keep Washington Evergreen",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "lemay-americas-car-museum",
                    title: "LeMay - America's Car Museum",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "special_interests/lemay.jpg",
                },
                {
                    id: "music-matters",
                    title: "Music Matters",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "special_interests/music_matters_2.jpg",
                },
                {
                    id: "share-the-road",
                    title: "Share the Road",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "special_interests/share_the_road.jpg",
                },
                {
                    id: "square-dancer",
                    title: "Square Dancer",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "throwback",
                    title: "Throwback",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "special_interests/throwback_2.jpg",
                },
            ],
        },
        {
            id: "sports",
            title: "Sports",
            sticker: { style: "red", mark: "SPT" },
            plates: [
                {
                    id: "seattle-kraken",
                    title: "Seattle Kraken",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "sports/kraken.jpg",
                },
                {
                    id: "seattle-mariners",
                    title: "Seattle Mariners",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "sports/mariners.jpg",
                },
                {
                    id: "seattle-seahawks",
                    title: "Seattle Seahawks",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "sports/seahawks_2.jpg",
                },
                {
                    id: "seattle-sounders-fc",
                    title: "Seattle Sounders FC",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "sports/sounders.jpg",
                },
                {
                    id: "seattle-storm",
                    title: "Seattle Storm",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "sports/storm.jpg",
                },
                {
                    id: "ski-and-ride",
                    title: "Ski and Ride",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "sports/ski_and_snowboard.jpg",
                },
                {
                    id: "state-sport-pickleball",
                    title: "State Sport: Pickleball",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "sports/pickleball.jpg",
                },
                {
                    id: "tennis",
                    title: "Tennis",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "sports/tennis.jpg",
                },
                {
                    id: "wrestling",
                    title: "Wrestling",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "sports/wrestling.jpg",
                },
            ],
        },
        {
            id: "tribal_self_issued",
            title: "Tribal, Self-Issued",
            sticker: { style: "black", mark: "TRB", foot: "Self-issued" },
            plates: [
                {
                    id: "colville-tribe",
                    title: "Colville Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "lummi-tribe",
                    title: "Lummi Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "quinault-tribe",
                    title: "Quinault Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "spokane-tribe",
                    title: "Spokane Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "tulalip-tribes",
                    title: "Tulalip Tribes",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "tribal/tulalip_tribes.jpg",
                },
                {
                    id: "yakima-nation",
                    title: "Yakima Nation",
                    photoStatus: PHOTO_STATUSES.NEEDS_UPGRADE,
                    asset: "tribal/yakima_nation.jpg",
                },
            ],
        },
        {
            id: "tribal",
            title: "Tribal, WA",
            sticker: { style: "black", mark: "TRB" },
            plates: [
                {
                    id: "chehalis-tribe",
                    title: "Chehalis Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "muckleshoot-tribe",
                    title: "Muckleshoot Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
                {
                    id: "puyallup-tribe",
                    title: "Puyallup Tribe",
                    photoStatus: PHOTO_STATUSES.MISSING,
                    asset: null,
                },
            ],
        },
        {
            id: "misc",
            title: "Miscellaneous",
            sticker: { style: "blue", mark: "MSC" },
            plates: [
                {
                    id: "dealer-plate",
                    title: "Dealer Plate",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "misc/dealer.jpg",
                },
                {
                    id: "disabled-parking",
                    title: "Disabled Parking",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "misc/disabled.jpg",
                },
                {
                    id: "exempt",
                    title: "Exempt",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "misc/xmt.jpg",
                },
                {
                    id: "personalized",
                    title: "Personalized",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "misc/personalized.jpg",
                },
                {
                    id: "rideshare",
                    title: "Rideshare",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "misc/ride_share.jpg",
                },
                {
                    id: "transporter",
                    title: "Transporter",
                    photoStatus: PHOTO_STATUSES.CURRENT,
                    asset: "misc/transporter.jpg",
                },
            ],
        },
    ];

    function photoStatusFor(plate) {
        return plate.photoStatus;
    }

    function imageKindFor(plate) {
        return plate.imageKind || IMAGE_KINDS.PLATE;
    }

    function imageAlt(plate) {
        return `${plate.title} ${imageKindFor(plate)}`;
    }

    function thumbnailPath(asset) {
        return asset ? `pics/thumbs/${asset}` : null;
    }

    function fullImagePath(asset) {
        return asset ? `pics/${asset}` : null;
    }

    function getPlateEntries(sourceCategories = categories) {
        return sourceCategories.flatMap((category) =>
            category.plates.map((plate) => ({ category, plate }))
        );
    }

    function categoriesWithStatus(status, sourceCategories = categories) {
        return sourceCategories
            .map((category) => ({
                category,
                plates: category.plates.filter(
                    (plate) => photoStatusFor(plate) === status
                ),
            }))
            .filter((group) => group.plates.length > 0);
    }

    function checklistGroups(sourceCategories = categories) {
        return {
            missing: categoriesWithStatus(PHOTO_STATUSES.MISSING, sourceCategories),
            needsUpgrade: categoriesWithStatus(
                PHOTO_STATUSES.NEEDS_UPGRADE,
                sourceCategories
            ),
        };
    }

    return {
        categories,
        photoStatuses: PHOTO_STATUSES,
        imageKinds: IMAGE_KINDS,
        stickerStyles: STICKER_STYLES,
        defaultStickerFoot: DEFAULT_STICKER_FOOT,
        photoStatusFor,
        imageKindFor,
        imageAlt,
        thumbnailPath,
        fullImagePath,
        getPlateEntries,
        categoriesWithStatus,
        checklistGroups,
    };
});
